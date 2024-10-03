export const SexualitySelector = ({ sexuality, setSexuality }) => (
    <div className="space-y-2">
        <Label>Sexuality</Label>
        <div className="flex space-x-2">
        {['Straight', 'Gay', 'Bisexual'].map((option) => (
            <Button
            key={option}
            type="button"
            variant={sexuality === option ? "default" : "outline"}
            onClick={() => setSexuality(option)}
            >
            {option}
            </Button>
        ))}
        </div>
    </div>
);