import React, { useEffect, useState } from "react";
import "./MatchView.css";
//Dodac automatyzacje aby dodawalo samo ze strony do listkow 
//wymyslec cos jeszcze
//komunikacja ze strony do zegara
function formatTime(totalSeconds) {
    const minutes = Math.floor((totalSeconds || 0) / 60);
    const seconds = (totalSeconds || 0) % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function MatchView() {
    const [match, setMatch] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get("data");

        if (!raw) {
            setError("Brak danych w adresie URL (parametr ?data=...).");
            return;
        }

        try {
            const parsed = JSON.parse(raw);

            const mapped = {
                homeTeam: parsed.h,
                awayTeam: parsed.a,
                scoreHome: parsed.hs,
                scoreAway: parsed.as,
                half: parsed.half,
                time: formatTime(parsed.time),
                firstHalfDuration: formatTime(parsed.h1),
                secondHalfDuration: formatTime(parsed.h2),
                events: (parsed.e || []).map((ev) => ({
                    minute: ev.m,
                    type: ev.t,
                    player: ev.n,
                    team: ev.team,
                    reason: ev.r || ""
                }))
            };

            setMatch(mapped);
        } catch (err) {
            setError("Nie udało się odczytać danych meczu z adresu URL.");
        }
    }, []);

    if (error) {
        return (
            <div className="match-container">
                <h1>⚽ Mecz</h1>
                <p className="error-text">{error}</p>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="match-container">
                <h1>⚽ Mecz</h1>
                <p>Wczytywanie danych...</p>
            </div>
        );
    }

    return (
        <div className="match-container">
            <h1>⚽ Mecz</h1>

            <div className="teams">
                <h2>{match.homeTeam}</h2>
                <div className="score">
                    {match.scoreHome} : {match.scoreAway}
                </div>
                <h2>{match.awayTeam}</h2>
            </div>

            {match.half && (
                <div className="half-info">
                    {match.half === 1 ? "1. Połowa" : "2. Połowa"}
                </div>
            )}

            <div className="time">
                ⏱ {match.time}
            </div>

            {(match.firstHalfDuration !== "00:00" || match.secondHalfDuration !== "00:00") && (
                <div className="half-durations">
                    {match.firstHalfDuration !== "00:00" && (
                        <p>1. Połowa trwała: {match.firstHalfDuration}</p>
                    )}
                    {match.secondHalfDuration !== "00:00" && (
                        <p>2. Połowa trwała: {match.secondHalfDuration}</p>
                    )}
                </div>
            )}

            <h3>Zdarzenia</h3>

            <div className="events">
                {match.events.length === 0 && (
                    <p className="no-events">Brak zdarzeń</p>
                )}

                {match.events.map((event, index) => (
                    <div key={index} className="event-row">
                        <span className="event-minute">{event.minute}'</span>
                        <span className="event-type">{event.type}</span>
                        <span className="event-team">{event.team}</span>
                        <span className="event-player">#{event.player}</span>
                        {event.reason && (
                            <span className="event-reason">({event.reason})</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MatchView;