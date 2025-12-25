import { useEffect, useState } from 'react';
import { getTours } from '../../services/tour.service';

export default function TourList() {
  const [tours, setTours] = useState<any[]>([]);

  useEffect(() => {
    getTours().then(res => setTours(res.data));
  }, []);

  return (
    <ul>
      {tours.map(t => (
        <li key={t._id}>{t.title}</li>
      ))}
    </ul>
  );
}
