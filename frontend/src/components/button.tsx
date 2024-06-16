import React from 'react';

interface ButtonProps {
	bgColor: 'mPrimary' | 'mSecondary' | 'mTertiary' | 'mQuaternary';
	text: string;
	txtColor: 'white' | 'black';
	icon?: string;
	onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ bgColor, txtColor, icon, onClick, text }) => {
	return (
		<button
		className={`bg-${bgColor} text-${txtColor} font-bold py-[16px] w-full rounded-full flex items-center justify-center`}
		onClick={onClick}
		aria-label={text}
		title={text}
		>
			{icon && <img src={icon} alt="" className="mr-2" />} {/* Assurez-vous que l'icône est rendue correctement */}

			{text}
		</button>
	);
};

export default Button;