import { useState } from 'react';

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [textField, setTextField] = useState('');
    const [wasmHash, setWasmHash] = useState('');
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

            fetch('/api/deployer', {
                method: 'POST',
                body: formData,
            }).then(response => {
                response.text().then(body => {
                    console.log("slc,ls");
                    console.log(body);
                    setWasmHash(body);
                    setModalOpen(true);
                }).catch(error => {
                    console.log(error);
                    setIsLoading(false);
                })
            }).catch(error => {
                console.log(error);
                setIsLoading(false);
            });

        }
        setIsLoading(false);
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
                <Modal isOpen={isModalOpen} onClose={closeModal} wasm_hash={wasmHash} />
            </div>
        </>
    );
}

// The modal to display after calories are added or subtracted.
const Modal = ({ isOpen, onClose, wasm_hash }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2> Contract deployed </h2>
                <h3>WASM hash: {wasm_hash}</h3>
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
