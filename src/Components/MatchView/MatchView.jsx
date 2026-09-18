import React, { useEffect, useState } from "react";
import "./MatchView.css";

import {
    collection,
    getDocs,
    doc,
    setDoc
} from "firebase/firestore";

import { db } from "../../firebase";


// ======================================================
// CZAS
// ======================================================

function formatTime(totalSeconds) {
    const seconds = Number(totalSeconds) || 0;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}


// ======================================================
// ID MECZU
// ======================================================

function createMatchId(homeTeam, awayTeam) {
    return `${homeTeam}_vs_${awayTeam}`
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9ąćęłńóśźż_-]/gi, "");
}


// ======================================================
// ZDARZENIE Z QR
// ======================================================

function mapQREvent(event, homeTeam, awayTeam) {
    if (!Array.isArray(event)) {
        return null;
    }

    const minute = event[0] ?? "";
    const type = event[1] ?? "";
    const player = event[2] ?? "";
    const teamCode = event[3] ?? "";
    const reason = event[4] ?? "";

    let team = "";

    if (teamCode === "h") {
        team = homeTeam;
    } else if (teamCode === "a") {
        team = awayTeam;
    } else {
        team = teamCode;
    }

    return {
        minute,
        type,
        player,
        team,
        reason
    };
}


// ======================================================
// ZDARZENIE Z FIREBASE
// ======================================================

function mapFirebaseEvent(event) {
    if (!event || typeof event !== "object") {
        return null;
    }

    return {
        minute: event.minute ?? "",
        type: event.type ?? "",
        player:
            event.player ??
            event.playerNumber ??
            "",
        team:
            event.team ??
            event.teamName ??
            "",
        reason:
            event.reason ??
            ""
    };
}


// ======================================================
// KLASA ZDARZENIA
// ======================================================

function getEventClass(type) {
    if (type === "⚽") {
        return "event-goal";
    }

    if (type === "🟨") {
        return "event-yellow";
    }

    if (type === "🟥") {
        return "event-red";
    }

    if (type === "🔄") {
        return "event-change";
    }

    return "event-default";
}


// ======================================================
// NAZWA ZDARZENIA
// ======================================================

function getEventLabel(type) {
    if (type === "⚽") {
        return "GOL";
    }

    if (type === "🟨") {
        return "ŻÓŁTA KARTKA";
    }

    if (type === "🟥") {
        return "CZERWONA KARTKA";
    }

    if (type === "🔄") {
        return "ZMIANA";
    }

    return "";
}


// ======================================================
// WIERSZ ZDARZENIA
// ======================================================

function EventRow({ event }) {
    if (!event) {
        return null;
    }

    const eventClass =
        getEventClass(event.type);

    const eventLabel =
        getEventLabel(event.type);

    return (
        <div
            className={`match-event ${eventClass}`}
        >
            <div className="event-time">
                {event.minute}'
            </div>

            <div className="event-icon">
                {event.type}
            </div>

            <div className="event-content">

                <div className="event-main">

                    <span className="event-team">
                        {event.team}
                    </span>

                    {event.player !== "" &&
                        event.player !== null && (
                            <span className="event-player">
                                #{event.player}
                            </span>
                        )}

                </div>

                {eventLabel && (
                    <div className="event-label">
                        {eventLabel}
                    </div>
                )}

                {event.reason && (
                    <div className="event-reason">
                        {event.reason}
                    </div>
                )}

            </div>
        </div>
    );
}


// ======================================================
// KARTA MECZU W HISTORII
// ======================================================

function MatchCard({
    match,
    active,
    onClick
}) {
    return (
        <button
            className={`match-slider-card ${
                active ? "active" : ""
            }`}
            onClick={onClick}
        >

            <div className="slider-card-teams">

                <span>
                    {match.homeTeam}
                </span>

                <strong>
                    {match.scoreHome}
                </strong>

            </div>


            <div className="slider-card-vs">
                -
            </div>


            <div className="slider-card-teams">

                <strong>
                    {match.scoreAway}
                </strong>

                <span>
                    {match.awayTeam}
                </span>

            </div>


            <div className="slider-card-date">

                {match.updatedAt
                    ? new Date(
                        match.updatedAt
                    ).toLocaleDateString(
                        "pl-PL"
                    )
                    : ""}

            </div>

        </button>
    );
}


// ======================================================
// ZAPIS MECZU DO FIREBASE
// ======================================================

async function saveMatchToFirebase(match) {

    try {

        const matchId =
            createMatchId(
                match.homeTeam,
                match.awayTeam
            );


        const matchRef = doc(
            db,
            "matches_qr_code",
            matchId
        );


        await setDoc(
            matchRef,
            {
                id: matchId,

                homeTeam:
                    match.homeTeam,

                awayTeam:
                    match.awayTeam,

                scoreHome:
                    match.scoreHome,

                scoreAway:
                    match.scoreAway,

                firstHalfDuration:
                    match.firstHalfDuration ??
                    "00:00",

                secondHalfDuration:
                    match.secondHalfDuration ??
                    "00:00",

                totalTime:
                    match.totalTime ??
                    "00:00",

                latestHalf2:
                    match.half ?? 1,

                events:
                    match.events ?? [],

                updatedAt:
                    new Date().toISOString()
            },
            {
                merge: true
            }
        );


        console.log(
            "✅ Mecz zapisany w Firebase:",
            matchId
        );


        return matchId;

    } catch (error) {

        console.error(
            "❌ Błąd zapisu meczu do Firebase:",
            error
        );

        return null;
    }
}


// ======================================================
// POBIERANIE MECZÓW Z FIREBASE
// ======================================================

async function loadMatchesFromFirebase() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "matches_qr_code"
            )
        );


    const matches =
        snapshot.docs.map((docSnapshot) => {

            const data =
                docSnapshot.data();


            const events =
                Array.isArray(data.events)
                    ? data.events
                        .map(
                            mapFirebaseEvent
                        )
                        .filter(Boolean)
                    : [];


            return {

                id:
                    docSnapshot.id,

                homeTeam:
                    data.homeTeam ??
                    "Gospodarze",

                awayTeam:
                    data.awayTeam ??
                    "Goście",

                scoreHome:
                    Number(
                        data.scoreHome
                    ) || 0,

                scoreAway:
                    Number(
                        data.scoreAway
                    ) || 0,

                half:
                    Number(
                        data.latestHalf2
                    ) || 1,

                firstHalfDuration:
                    data.firstHalfDuration ??
                    "00:00",

                secondHalfDuration:
                    data.secondHalfDuration ??
                    "00:00",

                totalTime:
                    data.totalTime ??
                    "00:00",

                updatedAt:
                    data.updatedAt ??
                    "",

                events
            };
        });


    // Najnowsze mecze na początku

    matches.sort(
        (a, b) => {

            const dateA =
                a.updatedAt
                    ? new Date(
                        a.updatedAt
                    ).getTime()
                    : 0;

            const dateB =
                b.updatedAt
                    ? new Date(
                        b.updatedAt
                    ).getTime()
                    : 0;

            return dateB - dateA;
        }
    );


    return matches;
}


// ======================================================
// GŁÓWNY KOMPONENT
// ======================================================

function MatchView() {

    const [match, setMatch] =
        useState(null);

    const [previousMatches, setPreviousMatches] =
        useState([]);

    const [selectedMatchId, setSelectedMatchId] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    // ==================================================
    // WCZYTANIE DANYCH
    // ==================================================

    useEffect(() => {

        const loadData =
            async () => {

                try {

                    setLoading(true);

                    setError(null);


                    // ----------------------------------
                    // QR
                    // ----------------------------------

                    const params =
                        new URLSearchParams(
                            window.location.search
                        );


                    const rawData =
                        params.get("data");


                    let currentQRMatch =
                        null;


                    if (rawData) {

                        try {

                            const parsed =
                                JSON.parse(
                                    rawData
                                );


                            const homeTeam =
                                parsed.h ??
                                "Gospodarze";


                            const awayTeam =
                                parsed.a ??
                                "Goście";


                            // --------------------------
                            // ZDARZENIA
                            // --------------------------

                            const events =
                                Array.isArray(
                                    parsed.e
                                )
                                    ? parsed.e
                                        .map(
                                            (event) =>
                                                mapQREvent(
                                                    event,
                                                    homeTeam,
                                                    awayTeam
                                                )
                                        )
                                        .filter(
                                            Boolean
                                        )
                                    : [];


                            // --------------------------
                            // OBIEKT MECZU
                            // --------------------------

                            currentQRMatch = {

                                id: "current",

                                homeTeam,

                                awayTeam,

                                scoreHome:
                                    Number(
                                        parsed.hs
                                    ) || 0,

                                scoreAway:
                                    Number(
                                        parsed.as
                                    ) || 0,

                                half:
                                    Number(
                                        parsed.half
                                    ) || 1,

                                time:
                                    formatTime(
                                        parsed.time
                                    ),

                                firstHalfDuration:
                                    formatTime(
                                        parsed.h1
                                    ),

                                secondHalfDuration:
                                    formatTime(
                                        parsed.h2
                                    ),

                                totalTime:
                                    formatTime(
                                        parsed.time
                                    ),

                                events
                            };


                            // --------------------------
                            // POKAŻ MECZ
                            // --------------------------

                            setMatch(
                                currentQRMatch
                            );


                            // --------------------------
                            // ZAPISZ DO FIREBASE
                            // --------------------------

                            await saveMatchToFirebase(
                                currentQRMatch
                            );

                        } catch (qrError) {

                            console.error(
                                "❌ Błąd odczytu QR:",
                                qrError
                            );

                            setError(
                                "Nieprawidłowe dane z kodu QR."
                            );

                            return;
                        }
                    }


                    // ==================================================
                    // POBIERAMY HISTORIĘ Z FIREBASE
                    // ==================================================

                    const matches =
                        await loadMatchesFromFirebase();


                    setPreviousMatches(
                        matches
                    );


                    // ==================================================
                    // JEŻELI NIE MA QR
                    // POKAŻ NAJNOWSZY MECZ
                    // ==================================================

                    if (
                        !currentQRMatch &&
                        matches.length > 0
                    ) {

                        setMatch(
                            matches[0]
                        );

                        setSelectedMatchId(
                            matches[0].id
                        );
                    }


                    // ==================================================
                    // JEŻELI JEST QR
                    // ZNAJDŹ JEGO DOKUMENT W FIREBASE
                    // ==================================================

                    if (
                        currentQRMatch
                    ) {

                        const qrMatchId =
                            createMatchId(
                                currentQRMatch.homeTeam,
                                currentQRMatch.awayTeam
                            );


                        setSelectedMatchId(
                            qrMatchId
                        );
                    }

                } catch (err) {

                    console.error(
                        "❌ Błąd MatchView:",
                        err
                    );


                    setError(
                        "Nie udało się wczytać danych meczu."
                    );

                } finally {

                    setLoading(false);
                }
            };


        loadData();

    }, []);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <div className="match-container">

                <div className="loading-card">

                    <div className="loading-spinner" />

                    <span>
                        Ładowanie meczu...
                    </span>

                </div>

            </div>
        );
    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (
            <div className="match-container">

                <div className="error-card">
                    {error}
                </div>

            </div>
        );
    }


    // ==================================================
    // BRAK MECZU
    // ==================================================

    if (!match) {

        return (
            <div className="match-container">

                <div className="empty-card">

                    Brak danych meczu.

                </div>

            </div>
        );
    }


    // ==================================================
    // WIDOK
    // ==================================================

    return (

        <div className="match-container">


            {/* =========================================
                HISTORIA MECZÓW
            ========================================= */}

            {previousMatches.length > 0 && (

                <section className="match-history">

                    <div className="section-heading">

                        <div>

                            <span className="section-kicker">
                                HISTORIA
                            </span>

                            <h2>
                                Ostatnie mecze
                            </h2>

                        </div>


                        <span className="slider-hint">
                            ← przesuń →
                        </span>

                    </div>


                    <div className="match-slider">

                        {previousMatches.map(
                            (previousMatch) => (

                                <MatchCard

                                    key={
                                        previousMatch.id
                                    }

                                    match={
                                        previousMatch
                                    }

                                    active={
                                        selectedMatchId ===
                                        previousMatch.id
                                    }

                                    onClick={() => {

                                        setMatch(
                                            previousMatch
                                        );

                                        setSelectedMatchId(
                                            previousMatch.id
                                        );

                                    }}

                                />

                            )
                        )}

                    </div>

                </section>
            )}


            {/* =========================================
                GŁÓWNA KARTA MECZU
            ========================================= */}

            <section className="match-card">


                <div className="match-header">

                    <span className="live-badge">
                        ⚽ MECZ
                    </span>


                    <span className="half-badge">

                        {match.half === 1
                            ? "1. POŁOWA"
                            : "2. POŁOWA"}

                    </span>

                </div>


                {/* =====================================
                    WYNIK
                ===================================== */}

                <div className="main-score">


                    <div className="main-team home">

                        <span className="team-name">
                            {match.homeTeam}
                        </span>

                        <span className="team-side">
                            GOSPODARZE
                        </span>

                    </div>


                    <div className="score-area">

                        <div className="big-score">

                            {match.scoreHome}

                            <span>
                                :
                            </span>

                            {match.scoreAway}

                        </div>


                        <div className="match-clock">

                            ⏱ {match.time}

                        </div>

                    </div>


                    <div className="main-team away">

                        <span className="team-name">
                            {match.awayTeam}
                        </span>

                        <span className="team-side">
                            GOŚCIE
                        </span>

                    </div>


                </div>


                {/* =====================================
                    CZASY
                ===================================== */}

                <div className="match-details">


                    <div className="detail-box">

                        <span>
                            1. POŁOWA
                        </span>

                        <strong>
                            {match.firstHalfDuration ??
                                "00:00"}
                        </strong>

                    </div>


                    <div className="detail-box">

                        <span>
                            2. POŁOWA
                        </span>

                        <strong>
                            {match.secondHalfDuration ??
                                "00:00"}
                        </strong>

                    </div>


                    {match.totalTime && (

                        <div className="detail-box">

                            <span>
                                ŁĄCZNIE
                            </span>

                            <strong>
                                {match.totalTime}
                            </strong>

                        </div>

                    )}

                </div>

            </section>


            {/* =========================================
                ZDARZENIA
            ========================================= */}

            <section className="events-section">


                <div className="section-heading">

                    <div>

                        <span className="section-kicker">
                            MECZ
                        </span>

                        <h2>
                            Zdarzenia
                        </h2>

                    </div>


                    <span className="event-count">
                        {match.events?.length ?? 0}
                    </span>

                </div>


                {/* BRAK ZDARZEŃ */}

                {!match.events ||
                match.events.length === 0 ? (

                    <div className="no-events-card">

                        <span>
                            ⚽
                        </span>

                        <p>
                            Brak zarejestrowanych
                            zdarzeń
                        </p>

                    </div>

                ) : (

                    <div className="events-timeline">

                        {match.events
                            .slice()
                            .sort(
                                (a, b) =>
                                    Number(
                                        a.minute
                                    ) -
                                    Number(
                                        b.minute
                                    )
                            )
                            .map(
                                (
                                    event,
                                    index
                                ) => (

                                    <EventRow
                                        key={
                                            index
                                        }
                                        event={
                                            event
                                        }
                                    />

                                )
                            )}

                    </div>

                )}

            </section>


        </div>
    );
}


export default MatchView;