const ExploreFilters = ({ filters, setFilters }) => {
    return (
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm">Age Range:</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-20"
              placeholder="Min"
              value={filters.minAge || ''}
              onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
            />
            <span>-</span>
            <Input
              type="number"
              className="w-20"
              placeholder="Max"
              value={filters.maxAge || ''}
              onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
            />
          </div>
        </div>
  
        {filters.hasLocation && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Max Distance (km):</label>
            <Input
              type="number"
              className="w-24"
              placeholder="Distance"
              value={filters.maxDistance || ''}
              onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
            />
          </div>
        )}
  
        <div className="flex items-center gap-2">
          <label className="text-sm">Interests:</label>
          <Select
            value={filters.interest || ''}
            onValueChange={(value) => setFilters({ ...filters, interest: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {uniqueInterests.map(interest => (
                <SelectItem key={interest} value={interest}>{interest}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
  
        <Button 
          variant="outline"
          onClick={() => setFilters({})}
          className="ml-auto"
        >
          Clear Filters
        </Button>
      </div>
    );
  };

  export default ExploreFilters;