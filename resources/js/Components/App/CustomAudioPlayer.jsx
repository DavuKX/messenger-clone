import React from 'react';
import {PauseCircleIcon, PlayCircleIcon} from "@heroicons/react/24/solid/index.js";

const CustomAudioPlayer = ({ file, showVolume = true}) => {
    const audioRef = React.useRef(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(1);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);

    const togglePlayPause = () => {
        const audio = audioRef.current;

        if (isPlaying) {
            audio.pause();
        } else {
            setDuration(audio.duration);
            audio.play();
        }
        setIsPlaying(!isPlaying);
    }

    const handleVolumeChange = (ev) => {
        const volume = ev.target.value;
        audioRef.current.volume = volume;
        setVolume(volume);
    }

    const handleTimeUpdate = (ev) => {
        const audio = audioRef.current;
        setDuration(audio.duration);
        setCurrentTime(ev.target.currentTime);
    }

    const handleLoadedMetadata = (ev) => {
        setDuration(ev.target.duration);
    }

    const handleSeekChange = (ev) => {
        const time = ev.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }

    return (
        <div className="w-full flex items-center gap-2 py-2 px-3 rounded-md bg-gray-300">
            <audio
                ref={audioRef}
                src={file.url}
                controls
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
            />
            <button onClick={togglePlayPause}>
                {isPlaying ? <PauseCircleIcon className="w-6 text-black-400" /> : <PlayCircleIcon className="w-6 text-gray-400" />}
            </button>
            {showVolume && (
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value="volume"
                    onChange={handleVolumeChange}
                />
            )}
            <input
                type="range"
                min="0"
                max={duration}
                step="0.01"
                value={currentTime}
                className="flex-1"
                onChange={handleSeekChange}
            />
        </div>
    );
};

export default CustomAudioPlayer;
