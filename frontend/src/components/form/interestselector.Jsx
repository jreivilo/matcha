import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const InterestSelector = ({ interests, setInterests, newInterest, setNewInterest, handleInterestAdd, removeInterest }) => {
    const handleInterestAdd = (e) => {
        e.preventDefault();
        if (newInterest && !interests.includes(newInterest)) {
          setInterests([...interests, newInterest]);
          setNewInterest('');
        }
      };
    
    const removeInterest = (index) => {
        setInterests(interests.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="space-y-2">
                </div> <Label htmlFor="interests">Interests</Label>
                <div className="flex space-x-2">
                <Input
                    id="interests"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInterestAdd(e);
                    }
                    }}
                    placeholder="Add an interest"
                />
                <Button type="button" onClick={handleInterestAdd}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((interest, index) => (
                    <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeInterest(index)}
                    >
                    {interest} ×
                    </Badge>
                ))}
            </div>
        </div>
        )
    }
export default InterestSelector;
