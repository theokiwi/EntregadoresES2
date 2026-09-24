import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-6 text-slate-600">Entregadores — em construção.</div>} />
    </Routes>
  );
}
