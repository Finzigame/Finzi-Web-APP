import React from 'react';
import Settings from './Settings';

type SettingsHomeProps = {
    onBackToSettings: () => void;
    onGoToLevels: () => void;
    onGoToProfile: () => void;
};

const SettingsHome: React.FC<SettingsHomeProps> = ({
    onBackToSettings,
    onGoToLevels,
    onGoToProfile,
}) => {
    return (
        <Settings
            onBackToSettings={onBackToSettings}
            onGoToLevels={onGoToLevels}
            onGoToProfile={onGoToProfile}
        />
    );
};

export default SettingsHome;
