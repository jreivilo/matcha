import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/api';
import CustomLayout from '@/components/MatchaLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useUserData } from '@/hooks/useUserData';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { calculateCommonInterests, calculateDistance, getPfpUrl } from '@/lib/utils';
import { SortingHeader, ExploreFilters } from '@/components/ExploreUtils';

const API_URL = import.meta.env.VITE_API_URL;

const additionalFilters = {
  onlineOnly: false,
  minFameRating: '',
  gender: 'any',
  sortBy: 'distance'
};

const ExploreProfile = ({ match, userInfo }) => (
  <div key={match.user_id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
    <Link 
      key={match.email}
      to={`/member/profile?username=${match.username}`}
      className="block p-4"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {match.picture_path && match.pics?.length > 0 && (
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-100 transition flex-shrink-0">
              <img
                src={getPfpUrl(match.picture_path, match.pics)}
                alt={match.first_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col">
            <div className="font-medium text-lg">{match.first_name} {match.last_name}</div>
            <Badge variant={match.active ? "success" : "secondary"} className="w-fit">
              {match.active ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Fame: {match.famerating}</span>
            <span>•</span>
            <span>{match.gender}</span>
            {match.coordinates && userInfo?.displayUser?.coordinates && (
              <>
                <span>•</span>
                <span>{Math.round(calculateDistance(userInfo.displayUser.coordinates, match.coordinates))}km away</span>
              </>
            )}
            {match.interests && userInfo?.displayUser?.interests && (
              <>
                <span>•</span>
                <span>{calculateCommonInterests(userInfo.displayUser.interests, match.interests)} common interests</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 justify-end">
            {match.interests?.map(interest => (
              <Badge 
                key={interest} 
                variant={userInfo?.displayUser?.interests?.includes(interest) ? "primary" : "secondary"}
                className="text-xs text-white"
              >
                #{interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  </div>
)

const Explore = () => {
  const { isAuthenticated, user } = useAuthStatus();
  const username = user?.username;

  const [sortField, setSortField] = useState('famerating');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    maxDistance: '',
    interest: '',
  })

  const { data: userInfo, isLoading: userInfoLoading } = useUserData(username);

  const { data: suggestions, isLoading : suggestionsLoading, error } = useQuery({
    queryKey: ['suggestions', username],
    queryFn: async () => fetcher(`${API_URL}/explore/get-suggestions`, { username,}, 'POST'),
    enabled: !!username && !!isAuthenticated,
  });

  const { data: blocked, isLoading: blockedLoading } = useQuery({
    queryKey: ['blocked'],
    queryFn: async () => fetcher(`${API_URL}/block/blocked-by`, { username }, 'POST'),
    enabled: !!username
  })

  const uniqueInterests = (() => {
    if (!suggestions?.matches) return [];
    const interests = suggestions.matches.map(match => match.interests).flat();
    return [...new Set(interests)];
  })();

  const filteredSuggestions = suggestions?.matches?.filter(profile => {
    if (filters.minAge && profile.age < filters.minAge) return false;
    if (filters.maxAge && profile.age > filters.maxAge) return false;
    if (filters.maxDistance && userInfo?.displayUser?.coordinates && profile.coordinates) {
      return calculateDistance(userInfo.displayUser.coordinates, profile.coordinates) <= filters.maxDistance;
    }
    if (filters.interest && !profile.interests?.includes(filters.interest)) return false;
    if (blocked?.blocked_by_usernames?.includes(profile.username)) return false;
    return true;
  });

  const sortedSuggestions = useMemo(() => {
    if (!filteredSuggestions) return [];
    
    return [...filteredSuggestions].sort((a, b) => {
      if (sortField === 'distance') {
        if (!userInfo?.displayUser?.coordinates) return 0;
        const distanceA = calculateDistance(userInfo.displayUser.coordinates, a.coordinates);
        const distanceB = calculateDistance(userInfo.displayUser.coordinates, b.coordinates);
        return sortDirection === 'desc' ? distanceB - distanceA : distanceA - distanceB;
      }
      
      if (sortField === 'commonInterests') {
        const aCommon = calculateCommonInterests(userInfo?.displayUser?.interests, a.interests);
        const bCommon = calculateCommonInterests(userInfo?.displayUser?.interests, b.interests);
        return sortDirection === 'desc' ? bCommon - aCommon : aCommon - bCommon;
      }

      return sortDirection === 'desc' ? b[sortField] - a[sortField] : a[sortField] - b[sortField];
    });
  }, [filteredSuggestions, sortField, sortDirection, userInfo]);
  

  {!sortedSuggestions?.length && (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium">No matches found</h3>
      <p className="text-gray-500">Try adjusting your filters</p>
    </div>
  )}

  if (userInfoLoading || suggestionsLoading || blockedLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <CustomLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="space-y-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Discover People
              </CardTitle>
              <Badge variant="outline" className="px-4 py-1">
                {sortedSuggestions?.length || 0} matches
              </Badge>
            </div>
            <ExploreFilters filters={filters} setFilters={setFilters} uniqueInterests={uniqueInterests} />
            <SortingHeader 
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedSuggestions?.map((match) => (
                <ExploreProfile key={match.username} match={match} userInfo={userInfo}/>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomLayout>
  );
};

export default Explore;