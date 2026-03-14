import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { museumApi } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Clock, Star } from 'lucide-react';
import type { Museum } from '../@types';
import { getMuseumImage } from '../utils/museumImages';

type Props = { searchTerm?: string };

const MuseumGrid: React.FC<Props> = ({ searchTerm = '' }) => {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([museumApi.getTypes(), museumApi.getStates()]).then(([t, s]) => {
      setTypes(t.types || []);
      setStates(s.states || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedType !== 'all') params.type = selectedType;
    if (selectedState !== 'all') params.state = selectedState;

    museumApi.getAll(params)
      .then((d) => setMuseums(d.museums || []))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedType, selectedState]);

  const FilterBtn = ({ value, current, set }: { value: string; current: string; set: (v: string) => void }) => (
    <Button
      variant={current === value ? 'default' : 'outline'}
      size="sm"
      onClick={() => set(value)}
      className={current === value ? 'bg-orange-600 hover:bg-orange-700' : ''}
    >
      {value === 'all' ? 'All' : value}
    </Button>
  );

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg" />
          <CardContent className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-4 bg-white rounded-lg shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-1">Type:</span>
          <FilterBtn value="all" current={selectedType} set={setSelectedType} />
          {types.map((t) => <FilterBtn key={t} value={t} current={selectedType} set={setSelectedType} />)}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-1">State:</span>
          <FilterBtn value="all" current={selectedState} set={setSelectedState} />
          {states.map((s) => <FilterBtn key={s} value={s} current={selectedState} set={setSelectedState} />)}
        </div>
      </div>

      <p className="text-sm text-gray-500">{museums.length} museum{museums.length !== 1 ? 's' : ''} found</p>

      {museums.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No museums found.</p>
          <Button variant="outline" onClick={() => { setSelectedType('all'); setSelectedState('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {museums.map((museum) => (
            <Card
              key={museum._id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              onClick={() => navigate(`/museum/${museum._id}`)}
            >
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                {museum.images?.[0] ? (
                  <img
                    src={getMuseumImage(museum.name) || museum.images[0]}
                    alt={museum.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg></div>
                )}
                <Badge className="absolute top-2 right-2 bg-orange-600 text-white">{museum.type}</Badge>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{museum.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{museum.city}, {museum.state}</span>
                </div>
                {museum.rating && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{museum.rating.toFixed(1)}</span>
                    {museum.totalReviews > 0 && (
                      <span className="text-gray-400">({museum.totalReviews.toLocaleString()})</span>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {museum.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{museum.description}</p>
                )}
                {museum.establishedYear && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>Est. {museum.establishedYear}</span>
                  </div>
                )}
                {museum.ticketPrices && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Adult ₹{museum.ticketPrices.adult}</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Child ₹{museum.ticketPrices.child}</span>
                  </div>
                )}
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate(`/museum/${museum._id}`); }}
                >
                  View & Book
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MuseumGrid;