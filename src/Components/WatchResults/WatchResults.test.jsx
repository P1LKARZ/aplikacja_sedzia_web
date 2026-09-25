import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getDocs, setDoc } from 'firebase/firestore';
import WatchResults from './WatchResults';

jest.mock('../../firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), getDocs: jest.fn(), doc: jest.fn(), setDoc: jest.fn(),
}));

const snapshot = (...records) => ({ docs: records.map(record => ({ id: record.id, data: () => record })) });

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState({}, '', '/wyniki-zegarka');
});

test('shows saved results, selects older matches and never imports QR data', async () => {
  window.history.replaceState({}, '', '/wyniki-zegarka?data=' + encodeURIComponent(JSON.stringify({h:'QR',a:'Test'})));
  getDocs.mockResolvedValue(snapshot(
    {id:'old',homeTeam:'Orzeł',awayTeam:'Lech',scoreHome:0,scoreAway:0,totalTime:'90:00',updatedAt:'2026-09-01'},
    {id:'new',homeTeam:'Wisła',awayTeam:'Górnik',scoreHome:2,scoreAway:1,totalTime:'92:00',updatedAt:'2026-09-25',events:[{minute:12,type:'⚽',team:'Wisła',player:9}]},
  ));
  render(<WatchResults />);
  expect(await screen.findByText('⏱ 92:00')).toBeInTheDocument();
  expect(screen.getByText('#9')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:/Orzeł/}));
  expect(screen.getByText('⏱ 90:00')).toBeInTheDocument();
  expect(setDoc).not.toHaveBeenCalled();
});

test('shows an empty state and loads new results when refreshed', async () => {
  getDocs.mockResolvedValueOnce(snapshot()).mockResolvedValueOnce(snapshot({id:'new',homeTeam:'Nowi',awayTeam:'Goście',totalTime:'45:00'}));
  render(<WatchResults />);
  expect(await screen.findByText(/Brak wyników z zegarka/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Odśwież wyniki'}));
  expect(await screen.findByText('⏱ 45:00')).toBeInTheDocument();
  expect(getDocs).toHaveBeenCalledTimes(2);
});

test('shows a read error and allows retry', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  getDocs.mockRejectedValueOnce(new Error('permission-denied')).mockResolvedValueOnce(snapshot());
  render(<WatchResults />);
  expect(await screen.findByText('Nie udało się wczytać danych meczu.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Odśwież wyniki'}));
  await waitFor(() => expect(screen.getByText(/Brak wyników z zegarka/)).toBeInTheDocument());
  consoleError.mockRestore();
});
