import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react'; // Import useState for state management
import { Badge } from '@/components/ui/badge'; // Assuming you're using a Badge component for the chips
import { DialogDescription } from '@radix-ui/react-dialog';

const SORT_OPTIONS = [
    { label: 'Fame Rating', field: 'famerating' },
    { label: 'Distance', field: 'distance' },
    { label: 'Common Interests', field: 'commonInterests' }
];

const FilterChips = ({ activeFilters, onRemove }) => {
    var filtered = Object.fromEntries(
        Object.entries(activeFilters).filter(
            ([k,v]) =>v!="")
        );

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(filtered).map(([key, value]) => (
                <Badge key={key} variant="outline" className="flex items-center gap-1">
                    {key}: {value}
                    <button onClick={() => onRemove(key)}>&times;</button>
                </Badge>
            ))}
        </div>
    )
}

export const SortingHeader = ({ sortField, sortDirection, onSort }) => (
    <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium">Sort by:</span>
        <div className="flex gap-2">
            {SORT_OPTIONS.map(({ label, field }) => (
                <Button
                    key={field}
                    variant={sortField === field ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onSort(field)}
                    className="flex items-center gap-1"
                >
                    {label}
                    {sortField === field && (
                        <span className="ml-1">
                            {sortDirection === 'desc' ? '↓' : '↑'}
                        </span>
                    )}
                </Button>
            ))}
        </div>
    </div>
);

export const MatchSkeleton = () => (
    <div className="animate-pulse flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
    </div>
);

export const ExploreFilters = ({ filters, setFilters, uniqueInterests }) => {
    const [activeFilters, setActiveFilters] = useState(filters);

    const handleFilterChange = (filterKey, value) => {
        const updatedFilters = { ...activeFilters, [filterKey]: value };
        setFilters(updatedFilters);
        setActiveFilters(updatedFilters);
    };

    const handleRemoveFilter = (filterKey) => {
        const updatedFilters = { ...activeFilters };
        delete updatedFilters[filterKey];
        setFilters(updatedFilters);
        setActiveFilters(updatedFilters);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                {/* Age Range */}
                <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg">
                    <label className="text-sm font-medium">Age:</label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            className="w-16 h-8 text-center"
                            placeholder="Min"
                            value={activeFilters.minAge || ''}
                            onChange={(e) => handleFilterChange('minAge', e.target.value)}
                        />
                        <span>-</span>
                        <Input
                            type="number"
                            className="w-16 h-8 text-center"
                            placeholder="Max"
                            value={activeFilters.maxAge || ''}
                            onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                        />
                    </div>
                </div>

                {activeFilters.hasLocation && (
                    <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg">
                        <label className="text-sm font-medium">Distance:</label>
                        <Input
                            type="number"
                            className="w-20 h-8 text-center"
                            placeholder="km"
                            value={activeFilters.maxDistance || ''}
                            onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                        />
                        <span className="text-sm">km</span>
                    </div>
                )}


                <Dialog>
                    <DialogTrigger className="flex items-center gap-2 bg-black/5 p-2 rounded-lg hover:bg-black/10 transition">
                        <label className="text-sm font-medium">Interests:</label>
                        <span className="text-sm">{activeFilters.interest || 'Any'}</span>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" aria-label="Interests Selector">
                        <DialogHeader>
                            <DialogTitle>Select Interest</DialogTitle>
                            <DialogDescription>to filter out profiles</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    className={`p-2 rounded-lg text-sm ${!activeFilters.interest ? 'bg-blue-500 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                                    onClick={() => handleFilterChange('interest', '')}
                                >
                                    Any
                                </button>
                                {uniqueInterests?.map(interest => (
                                    <button
                                        key={interest}
                                        className={`p-2 rounded-lg text-sm ${activeFilters.interest === interest ? 'bg-blue-500 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                                        onClick={() => handleFilterChange('interest', interest)}
                                    >
                                        #{interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="outline"
                    onClick={() => setActiveFilters({})}
                    className="ml-auto"
                >
                    Clear Filters
                </Button>
            </div>

            <FilterChips activeFilters={activeFilters} onRemove={handleRemoveFilter} />
        </div>
    );
};
