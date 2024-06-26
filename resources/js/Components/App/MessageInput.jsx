import React, {useState} from 'react';
import {
    FaceSmileIcon,
    HandThumbUpIcon,
    PaperAirplaneIcon,
    PaperClipIcon,
    PhotoIcon, XCircleIcon
} from "@heroicons/react/24/solid/index.js";
import NewMessageInput from "@/Components/App/NewMessageInput.jsx";
import EmojiPicker from "emoji-picker-react";
import {Popover} from "@headlessui/react";
import AttachmentPreview from "@/Components/App/AttachmentPreview.jsx";
import CustomAudioPlayer from "@/Components/App/CustomAudioPlayer.jsx";
import {isAudio, isImage} from "@/helpers.js";
import AudioRecorder from "@/Components/App/AudioRecorder.jsx";

const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState('');
    const [inputErrorMessage, setInputErrorMessage] = useState('');
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFiles, setChosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const recordedAudioReady = (file, url) => {
        setChosenFiles((prevFiles) => {
            return [...prevFiles, {
                file,
                url,
            }];
        });
    }

    const onFileChange = (event) => {
        const files = event.target.files;
        const updatedFiles = [...files].map((file) => {
            return {
                file: file,
                url: URL.createObjectURL(file),
            }
        });

        setChosenFiles((prevFiles) => {
            return [...prevFiles, ...updatedFiles];
        });
    }

    const onSendClick = () => {
        if (messageSending) {
            return;
        }

        if (newMessage.trim() === '' && chosenFiles.length === 0) {
            setInputErrorMessage('Please provide a message or upload attachments.');
            setTimeout(() => {
                setInputErrorMessage('');
            }, 3000);
            return;
        }

        const formData = new FormData();
        formData.append('message', newMessage);
        chosenFiles.forEach((file) => {
            formData.append('attachments[]', file.file);
        });

        if (conversation.is_user) {
            formData.append('receiver_id', conversation.id);
        } else if (conversation.is_group) {
            formData.append('group_id', conversation.id);
        }

        setMessageSending(true);
        axios.post(route("message.store"), formData, {
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                setUploadProgress(progress);
            }
        }).then((response) => {
            setNewMessage('');
            setMessageSending(false);
            setUploadProgress(0);
            setChosenFiles([]);
        }).catch((error) => {
            setMessageSending(false);
            setChosenFiles([]);
            const message = error?.response?.data?.message;
            setInputErrorMessage(message || 'An error occurred while sending the message.');
        });
    };

    const onLikeClick = () => {
        if (messageSending) {
            return;
        }

        const data = {
            message: "👍",
        }

        if (conversation.is_user) {
            data['receiver_id'] = conversation.id;
        } else if (conversation.is_group) {
            data['group_id'] = conversation.id;
        }

        axios.post(route("message.store"), data)
            .then((response) => {})
    };
    return (
        <div className="flex flex-wrap items-start border-t border-slate-700 py-3">
            <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2">
                <button className="p-1 text-gray-500 hover:text-gray-700 relative">
                    <PaperClipIcon className="w-6"/>
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <button className="p-1 text-gray-500 hover:text-gray-700 relative">
                    <PhotoIcon className="w-6"/>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={onFileChange}
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <AudioRecorder fileReady={recordedAudioReady}/>
            </div>
            <div className="order-1 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative">
                <div className="flex">
                    <NewMessageInput
                        value={newMessage}
                        onSend={onSendClick}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button onClick={onSendClick} disabled={messageSending} className="btn btn-info rounded-1-none">
                        {messageSending && (
                            <span className="loading loading-spinner loading-xs"/>
                        )}
                        <PaperAirplaneIcon className="w-6 h-6"/>
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </div>{" "}
                {!!uploadProgress && (
                    <progress
                        className="progress progess-info w-full"
                        value={uploadProgress}
                        max="100"
                    ></progress>
                )}
                {inputErrorMessage && (
                    <p className="text-red-400 text-xs">{inputErrorMessage}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                    {chosenFiles.map((file) => (
                        <div
                            key={file.file.name}
                            className={`relative flex justify-between cursor-pointer ` + (!isImage(file.file) ? " w-[240px]" : "")}
                        >
                            {isImage(file.file) && (
                                <img src={file.url} alt="" className="w-16 h-16 object-cover"/>
                            )}
                            {isAudio(file.file) && (
                                <CustomAudioPlayer file={file} showVolume={false}/>
                            )}
                            {!isAudio(file.file) && !isImage(file.file) && (
                                <AttachmentPreview file={file} />
                            )}

                            <button
                                onClick={() => setChosenFiles(chosenFiles.filter(f => f.file.name !== file.file.name))}
                                className="absolute w-6 h-6 rounded-full bg-gray-800 -right-2 -top-2 text-gray-300 hover:text-gray-100 z-10"
                            >
                                <XCircleIcon className="w-6" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="order-3 xs:order-3 p-2 flex">
                <Popover className="relative">
                    <Popover.Button className="p-1 text-gray-500 hover:text-gray-700">
                        <FaceSmileIcon className="w-6 h-6"/>
                    </Popover.Button>
                    <Popover.Panel className="absolute z-10 right-0 bottom-full">
                        <EmojiPicker
                            disableAutoFocus={true}
                            onEmojiClick={(event) => {
                                setNewMessage(newMessage + event.emoji);
                            }}
                        />
                    </Popover.Panel>
                </Popover>
                <button onClick={onLikeClick} className="p-1 text-gray-500 hover:text-gray-700">
                    <HandThumbUpIcon className="w-6 h-6"/>
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
