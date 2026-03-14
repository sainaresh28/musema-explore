import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { bookingApi } from '../api';
import { TIME_SLOTS } from '../utils/constants';

const MOCK_DATA = [20, 45, 80, 110, 75, 90, 60, 40, 15];

const BusyTimeChart: React.FC = () => {
  const [chartData, setChartData] = useState(
    TIME_SLOTS.map((time, i) => ({ time, visitors: MOCK_DATA[i] || 0 }))
  );

  useEffect(() => {
    bookingApi.getBusyTimes()
      .then((data) => {
        const map = new Map((data.stats || []).map((s: any) => [s._id, s.totalVisitors]));
        setChartData(TIME_SLOTS.map((time, i) => ({
          time,
          visitors: (map.get(time) as number) || MOCK_DATA[i] || 0
        })));
      })
      .catch(() => { /* keep mock data */ });
  }, []);

  return (
    <section className="py-8 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🕐</span>
              <span>Best Times to Visit</span>
            </CardTitle>
            <p className="text-sm text-gray-500">Peak visitor hours across all museums</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} visitors`, 'Visitors']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar dataKey="visitors" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BusyTimeChart;
