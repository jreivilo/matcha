const GenderSelector = ({ gender, setGender }) => (
    <div className="space-y-2">
        <Label>Gender</Label>
        <div className="flex space-x-2">
        {['Male', 'Female', 'Other'].map((option) => (
            <Button
            key={option}
            type="button"
            variant={gender === option ? "default" : "outline"}
            onClick={() => setGender(option)}
            >
            {option}
            </Button>
        ))}
        </div>
    </div>
);

export default GenderSelector;