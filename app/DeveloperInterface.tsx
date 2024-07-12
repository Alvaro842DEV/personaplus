// DeveloperInterface.tsx
// Página que muestra ciertos logs de la consola para ayudar al desarrollador

import * as React from "react";
import * as Native from "react-native";
import * as Router from "expo-router";
import BottomNav from "@/components/BottomNav";
import BetterText from "@/components/BetterText";
import GapView from "@/components/GapView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Buttons";
import { version as ReactVersion } from "react";
import { version as PersonaPlusVersion } from "@/package.json";

// TypeScript, supongo
import { Objective } from "@/components/types/Objective";

interface Log {
    message: string;
    type: "log" | "warn" | "error" | "success";
    timestamp: number;
}

const styles = Native.StyleSheet.create({
    consoleview: {
        flex: 1,
        padding: 10,
        backgroundColor: "#f0f0f0",
        width: "100%",
        height: "100%",
    },
    mainview: {
        padding: 20,
        flex: 1,
        flexDirection: "column",
        overflow: "scroll",
    },
    logText: {
        marginBottom: 5,
    },
    log: {
        color: "#000000",
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: "#000000",
    },
    success: {
        color: "#28a745",
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: "#28a745",
    },
    warn: {
        color: "#ff9900",
        paddingLeft: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#ff9900",
    },
    error: {
        color: "#ff0000",
        paddingLeft: 10,
        borderLeftWidth: 6,
        borderLeftColor: "#ff0000",
    },
    containerview: {
        width: "100%",
        height: "100%",
    },
});

const globalLogs: Log[] = [];

const addLogToGlobal = (log: Log) => {
    globalLogs.push(log);
};

export const testLog = (
    message: string,
    type: "log" | "warn" | "error" | "success" = "log"
) => {
    const logMessage = message.toString();
    const timestamp = Date.now();
    const newLog: Log = { message: logMessage, type, timestamp };

    addLogToGlobal(newLog);

    console[type === "success" ? "log" : type](logMessage);

    const prefix = {
        success: "GOD",
        error: "ERR",
        warn: "WAR",
        log: "LOG",
    }[type];

    console.log(`${prefix} ${message}`);
};

export const termLog = (
    message: string,
    type: "log" | "warn" | "error" | "success" = "log"
) => {
    /*const styles = {
        log: "font-weight: bold; background: #FFF; color: black; padding: 2px 4px; border-radius: 2px;",
        success:
            "font-weight: bold; background: #30FF97; color: black; padding: 2px 4px; border-radius: 2px;",
        warn: "font-weight: bold; background: #FFD700; color: black; padding: 2px 4px; border-radius: 2px;",
        error: "font-weight: bold; background: #FF3232; color: black; padding: 2px 4px; border-radius: 2px;",
    }[type];

    const prefix = {
        log: "LOG",
        success: "GOD",
        warn: "WAR",
        error: "ERR",
    }[type];*/

    // console.log(`%c${prefix}%c ${message}`, styles, "background: transparent;");
    // testLog(message, type);
    console.log(message);
};

export default function DeveloperInterface() {
    const [logs, setLogs] = React.useState<Log[]>([]);

    React.useEffect(() => {
        const updateLogs = (newLog: Log) => {
            setLogs(prevLogs => [...prevLogs, newLog]);
            addLogToGlobal(newLog);
        };

        const originalConsoleLog = console.log;
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;

        console.log = (message: string, ...optionalParams: unknown[]) => {
            const newLog: Log = {
                message: message.toString(),
                type: "log",
                timestamp: Date.now(),
            };
            updateLogs(newLog);
            originalConsoleLog(message, ...optionalParams);
        };

        console.warn = (message: string, ...optionalParams: unknown[]) => {
            const newLog: Log = {
                message: message.toString(),
                type: "warn",
                timestamp: Date.now(),
            };
            updateLogs(newLog);
            originalConsoleWarn(message, ...optionalParams);
        };

        console.error = (message: string, ...optionalParams: unknown[]) => {
            const newLog: Log = {
                message: message.toString(),
                type: "error",
                timestamp: Date.now(),
            };
            updateLogs(newLog);
            originalConsoleError(message, ...optionalParams);
        };

        return () => {
            console.log = originalConsoleLog;
            console.warn = originalConsoleWarn;
            console.error = originalConsoleError;
        };
    }, []);

    const [objs, setObjs] = React.useState<{ [key: string]: Objective } | null>(
        null
    );

    React.useEffect(() => {
        const fetchObjectives = async () => {
            try {
                const storedObjs = await AsyncStorage.getItem("objectives");
                if (storedObjs) {
                    setObjs(JSON.parse(storedObjs));
                    termLog("Objectives (OBJS) fetched and parsed!", "success");
                } else {
                    await AsyncStorage.setItem(
                        "objectives",
                        JSON.stringify([])
                    );
                    setObjs(JSON.parse("[]"));
                    termLog(
                        "Could not get objectives (OBJS) fetched! Setting them to an empty array ( [] )",
                        "warn"
                    );
                }
            } catch (e) {
                const log = `Could not get objectives (OBJS) fetched due to error: ${e}`;
                termLog(log, "error");
            }
        };

        fetchObjectives();
    }, []);

    const currentPage: string = Router.usePathname();

    const devFCclearobjs = async () => {
        try {
            await AsyncStorage.setItem("objectives", "");
            console.log("DEV CLEARED OBJS");
            termLog("DEV CLEARED OBJS", "log");
            Router.router.navigate("/");
        } catch (e) {
            console.error(e);
            termLog(String(e), "error");
        }
    };

    const devFCclearall = async () => {
        try {
            await AsyncStorage.multiRemove([
                "useDevTools",
                "hasLaunched",
                "age",
                "gender",
                "height",
                "weight",
                "focuspoint",
                "objectives",
                "username",
                "sleep",
            ]);
            Router.router.navigate("/WelcomeScreen");
            console.log("DEV CLEARED ALL");
            termLog("DEV CLEARED ALL", "log");
        } catch (e) {
            console.error(e);
            termLog(String(e), "error");
        }
    };

    return (
        <Native.View style={styles.containerview}>
            <BottomNav currentLocation={currentPage} />
            <Native.ScrollView style={styles.mainview}>
                <GapView height={20} />
                <BetterText
                    textAlign="normal"
                    fontWeight="Regular"
                    fontSize={35}
                >
                    Dev interface
                </BetterText>
                <BetterText
                    textAlign="normal"
                    fontWeight="Italic"
                    fontSize={15}
                >
                    Note: Currently many things here are broken / don&apos;t
                    work properly. Will look onto that.
                </BetterText>
                <GapView height={20} />
                <BetterText textAlign="normal" fontWeight="Bold" fontSize={20}>
                    Options
                </BetterText>
                <GapView height={5} />
                <Button
                    action={() => Router.router.navigate("/WelcomeScreen")}
                    buttonText="Go to Welcome Screen"
                    style="ACE"
                />
                <GapView height={5} />
                <Button
                    action={() => Router.router.navigate("/openhealthtest")}
                    buttonText="Go to Open Health test page"
                    style="ACE"
                />
                <GapView height={5} />
                <Button
                    action={devFCclearobjs}
                    buttonText="CLEAR OBJECTIVES"
                    style="HMM"
                />
                <GapView height={5} />
                <Button
                    action={devFCclearall}
                    buttonText="CLEAR ALL (Reset app, basically)"
                    style="WOR"
                />
                <GapView height={20} />
                <BetterText textAlign="normal" fontWeight="Bold" fontSize={20}>
                    Logs
                </BetterText>
                <GapView height={5} />
                <Native.View style={styles.consoleview}>
                    <BetterText
                        fontWeight="Regular"
                        textColor="#000"
                        textAlign="normal"
                        fontSize={15}
                    >
                        {JSON.stringify(objs)}
                    </BetterText>
                </Native.View>
                <GapView height={20} />
                <BetterText textAlign="normal" fontWeight="Bold" fontSize={20}>
                    Logs
                </BetterText>
                <GapView height={5} />
                <Native.View style={styles.consoleview}>
                    {logs.map((log, index) => (
                        <Native.Text
                            key={index}
                            style={[styles.logText, styles[log.type]]}
                        >
                            [{new Date(log.timestamp).toLocaleTimeString()}] (
                            {log.type.toUpperCase()}) {log.message}
                        </Native.Text>
                    ))}
                </Native.View>
                <GapView height={10} />
                <BetterText textAlign="normal" fontWeight="Bold" fontSize={12}>
                    Running React Native v{ReactVersion} and PersonaPlus v
                    {PersonaPlusVersion}
                </BetterText>
                <GapView height={80} />
            </Native.ScrollView>
        </Native.View>
    );
}
