#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, Map, String, Vec};

// DataKey has only one variant user information in the form of an Address.
#[contracttype]
pub enum DataKey {
    Deployer(Address),
}

#[contract]
pub struct ContractDeployer;

#[contractimpl]
impl ContractDeployer {
    pub fn deploy(
        env: Env,
        user: Address,
        name: String,
        contract_id: String,
        metadata: String,
        time: String,
    ) {
        user.require_auth();
        let key = DataKey::Deployer(user.clone());
        let val: Option<Map<String, Vec<(String, String, String)>>> =
            env.storage().instance().get(&key);
        env.storage().instance().extend_ttl(103680, 120960);

        if let Some(mut app) = val {
            let res: Option<Vec<(String, String, String)>> = app.get(name.clone());
            if let Some(mut contracts) = res {
                contracts.push_back((contract_id, metadata, time));
                app.set(name, contracts);
                env.storage().instance().set(&key, &app);
            } else {
                let contracts = vec![&env, (contract_id, metadata, time)];
                app.set(name, contracts);
                env.storage().instance().set(&key, &app);
            }
        } else {
            let mut app = Map::new(&env);
            let contracts = vec![&env, (contract_id, metadata, time)];
            app.set(name, contracts);
            env.storage().instance().set(&key, &app);
        }
    }

    pub fn get_contracts(env: Env, user: Address, name: String) -> Vec<(String, String, String)> {
        user.require_auth();
        let key = DataKey::Deployer(user.clone());
        let val: Option<Map<String, Vec<(String, String, String)>>> =
            env.storage().instance().get(&key);
        env.storage().instance().extend_ttl(103680, 120960);

        if let Some(app) = val {
            let res: Option<Vec<(String, String, String)>> = app.get(name.clone());
            if let Some(contracts) = res {
                return contracts;
            }
        }

        return Vec::new(&env);
    }
}
