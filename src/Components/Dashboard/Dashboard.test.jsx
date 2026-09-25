import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getDocs } from 'firebase/firestore';
import Dashboard from './Dashboard';

jest.mock('../../firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), getDocs: jest.fn() }));
jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }));
const user = {uid:'user', email:'Marcel@example.test'};
beforeEach(() => jest.clearAllMocks());

test('displays actual counts, numeric payments and zero scores', async () => {
  getDocs.mockResolvedValue({docs:[{id:'1',data:()=>({gospodarz:'Orzeł',gosc:'Wisła',data:'2026-09-01',kasa:'210',zaplacone:'N',wynikGospodarz:0,wynikGosc:0,zolteKartkiGospodarz:'2',zolteKartkiGosc:'1'})}]});
  render(<Dashboard user={user} />);
  expect(await screen.findByText('210 zł')).toBeInTheDocument();
  expect(screen.getByText('0 : 0')).toBeInTheDocument();
  expect(screen.getByText('Średnio 3.00 na mecz z wynikiem')).toBeInTheDocument();
  expect(screen.getByText('378 łącznie z historią')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Otwórz wyniki'})).toHaveAttribute('href','/wyniki-zegarka');
});

test('offers retry after a failed request and shows a useful empty state', async () => {
  getDocs.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({docs:[]});
  render(<Dashboard user={user} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się pobrać meczów');
  fireEvent.click(screen.getByRole('button',{name:'Ponów'}));
  expect(await screen.findByText('Twój terminarz jest jeszcze pusty.')).toBeInTheDocument();
  expect(getDocs).toHaveBeenCalledTimes(2);
});
