import { filterMatches } from './filterMatches';

const filters = {
  team: '', gospodarz: '', gosc: '', liga: '', sedzia: '',
  dataFrom: '', dataTo: '', nrMeczu: '', zaplacone: 'all',
  delegacja: 'all', rundy: [], sezon: 'all',
};
const matches = [
  { id: 'a', gospodarz: 'Orzeł', gosc: 'Wisła', liga: 'A', glowny: 'Jan', data: '2026-03-01', numer_meczu: 123, kasa: 80, zaplacone: 'T', delegacja: 1 },
  { id: 'b', gospodarz: 'Wisła', gosc: 'Lech', liga: 'B', glowny: 'Adam', data: '2026-09-25', numer_meczu: 456, kasa: 120, zaplacone: 'N', delegacja: 0 },
  { id: 'c', data: '2026-09-26', runda: 'jesienna', sezon: '2026/2027' },
];
const ids = (overrides = {}, sort = 'data-desc') =>
  filterMatches(matches, { ...filters, ...overrides }, sort).map(m => m.id);

test('filters either team and combines case-insensitive text filters', () => {
  expect(ids({ team: 'WISŁA' })).toEqual(['b', 'a']);
  expect(ids({ gospodarz: 'wisła', gosc: 'lech', liga: 'b', sedzia: 'ADAM' })).toEqual(['b']);
});
test('includes date range endpoints and numeric match numbers', () => {
  expect(ids({ dataFrom: '2026-09-25', dataTo: '2026-09-25', nrMeczu: '45' })).toEqual(['b']);
});
test('combines payment and delegation filters', () => {
  expect(ids({ zaplacone: 'T', delegacja: 'delegacja' })).toEqual(['a']);
  expect(ids({ zaplacone: 'T', delegacja: 'edelegacja' })).toEqual([]);
});
test('derives seasons for older records without stored season fields', () => {
  expect(ids({ rundy: ['wiosenna'], sezon: '2025/2026' })).toEqual(['a']);
  expect(ids({ rundy: ['jesienna'], sezon: '2026/2027' })).toEqual(['c', 'b']);
  expect(ids()).toHaveLength(3);
});
test('sorts without modifying the input array', () => {
  expect(ids({}, 'data-asc')).toEqual(['a', 'b', 'c']);
  expect(ids({}, 'kasa-desc')).toEqual(['b', 'a', 'c']);
  expect(matches.map(m => m.id)).toEqual(['a', 'b', 'c']);
});
