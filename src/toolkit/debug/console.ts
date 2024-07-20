import AsyncStorage from "@react-native-async-storage/async-storage";
import { Log } from "@/src/types/Logs";

// Función para obtener logs desde AsyncStorage
/**
 * Returns logs saved on the AsyncStorage.
 *
 * @async
 * @returns {Promise<Log[]>} A Log array (`Log[]`)
 */
export const getLogsFromStorage = async (): Promise<Log[]> => {
    try {
        const logsString = await AsyncStorage.getItem("globalLogs");
        if (logsString) {
            return JSON.parse(logsString);
        }
    } catch (e) {
        termLog("Error fetching logs from AsyncStorage: " + e, "error");
    }
    return [];
};

/**
 * Saves a given array of Logs (`Log[]`) to the AsyncStorage.
 *
 * @async
 * @param {Log[]} logs An array of logs
 * @returns {*} No return, it just works. Otherwise, logs an error.
 */
const saveLogsToStorage = async (logs: Log[]) => {
    try {
        await AsyncStorage.setItem("globalLogs", JSON.stringify(logs));
    } catch (e) {
        termLog("Error saving logs to AsyncStorage: " + e, "error");
    }
};

/**
 * Securely updates logs in the AsyncStorage. ("securely" means if you used the `saveLogsToStorage()` function directly it would overwrite the file, while this one will keep the past logs).
 *
 * @async
 * @param {Log} log The log to be added.
 * @returns {*} No return, it just works. Otherwise, logs an error.
 */
export const addLogToGlobal = async (log: Log) => {
    try {
        const currentLogs = await getLogsFromStorage();
        const updatedLogs = [...currentLogs, log];
        await saveLogsToStorage(updatedLogs);
    } catch (e) {
        termLog("Error adding log to AsyncStorage: " + e, "error");
    }
};

/**
 * Logs stuff. Generates a standard `console.log` AND also saves the log to an app-generated file (well, an AsyncStorage item that can be exported), so logs can be viewed from the production APK. And by the way, also adds a fourth "success" kind of log, on top of log, error, and warn. On the console appears as a log, but on the device appears as a cool-looking green log ;]
 *
 * @param {string} message The message to be logged
 * @param {("log" | "warn" | "error" | "success")} type The kind of message you're logging. Either a standard log, warning, error message, or success message.
 */
export const termLog = (
    message: string,
    type: "log" | "warn" | "error" | "success"
) => {
    console.log(message);
    const timestamp = Date.now();
    const newLog: Log = { message: message, type, timestamp };
    addLogToGlobal(newLog);
};
