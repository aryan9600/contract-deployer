const formidable = require('formidable');
const fs = require('fs');
const serverSdk = require('stellar-sdk/lib/soroban');
const sdk = require('stellar-sdk');

const server = new serverSdk.Server('https://rpc-futurenet.stellar.org');

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req, res) {
    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing the form:', err);
                return res.status(500).send('Error parsing the form');
            }

            try {
                // Log text field
                const pk = fields.textField[0];

                // Log file content
                const file = files.file;
                const data = fs.readFileSync(file[0].filepath);

                const hash = sdk.hash(data);
                let op = sdk.Operation.uploadContractWasm({ wasm: data });

                let contractHash = '';
                const sourceKeypair = sdk.Keypair.fromSecret(pk);
                const sourcePublicKey = sourceKeypair.publicKey();
                const account = await server.getAccount(sourcePublicKey);

                let tx = new sdk.TransactionBuilder(account, { fee: sdk.BASE_FEE })
                    .setNetworkPassphrase(sdk.Networks.FUTURENET)
                    .setTimeout(30)
                    .addOperation(op)
                    .build();
                try {
                    const preparedTransaction = await server.prepareTransaction(tx);
                    preparedTransaction.sign(sourceKeypair);
                    const submitTransactionResponse = await server.sendTransaction(preparedTransaction);
                    for (let i = 0; i < 10; i++) {
                        const val = await server.getTransaction(submitTransactionResponse.hash);
                        if (val.returnValue === undefined || val.returnValue === null) {
                            continue
                        }
                        contractHash = val.returnValue.toXDR('hex').slice(16);
                    }
                } catch (error) {
                    console.log("error uploading", error);
                }

                let contractOp = sdk.Operation.createCustomContract({
                    address: new sdk.Address(sourcePublicKey),
                    wasmHash: hash,
                });

                let contractTx = new sdk.TransactionBuilder(account, { fee: sdk.BASE_FEE })
                    .setNetworkPassphrase(sdk.Networks.FUTURENET)
                    .setTimeout(30)
                    .addOperation(contractOp)
                    .build();
                try {
                    const preparedTransaction = await server.prepareTransaction(contractTx);
                    preparedTransaction.sign(sourceKeypair);
                    const submitTransactionResponse = await server.sendTransaction(preparedTransaction);
                    for (let i = 0; i < 10; i++) {
                        const val = await server.getTransaction(submitTransactionResponse.hash);
                        if (val.returnValue === undefined || val.returnValue === null) {
                            console.log("continuing in create");
                            continue
                        }
                    }
                } catch (error) {
                    console.log("error creating", error);

                }

                console.log(contractHash);
                res.status(201).send(contractHash);

            } catch (error) {
                console.error('Error processing form:', error);
                res.status(500).send('Error processing form');
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

