import { useState } from 'react';

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [textField, setTextField] = useState('');
    const [wasmHash, setWasmHash] = useState('');
    const [contractID, setContractID] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const closeModal = () => setModalOpen(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleTextChange = (event) => {
        setTextField(event.target.value);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('textField', textField);

            try {
                const response = await fetch('/api/deployer', {
                    method: 'POST',
                    body: formData,
                });

                const body = await response.json();
                setWasmHash(body.wasmHash);
                setContractID(body.id);
                setModalOpen(true);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div>
                <NavBar />
            </div>
            <div className='container'>
                <h2> Your private key </h2>
                <p> (its not logged or stored! 😉) </p>
                <input type="text" value={textField} onChange={handleTextChange} />
                <h2> Upload the wasm file </h2>
                <input type="file" onChange={handleFileChange} />
                {isLoading ? (
                    <div className="spinner"></div> // Spinner element
                ) : (
                    <button onClick={handleSubmit} disabled={isLoading}>Deploy</button>
                )}
                <Modal isOpen={isModalOpen} onClose={closeModal} wasmHash={wasmHash} contractID={contractID} />
            </div>
        </>
    );
}

// The modal to display after calories are added or subtracted.
const Modal = ({ isOpen, onClose, wasmHash, contractID }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2> Contract deployed! </h2>
                <br></br>
                <h3>WASM hash: {wasmHash}</h3>
                <h3>Contract ID: {contractID}</h3>
                <div className="modal-actions">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const NavBar = () => {
    return (
        <div className="navbar">
            <h1>Soroban Smart Contract Deployer</h1>
        </div>
    );
};
