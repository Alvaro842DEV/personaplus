// Dashboard.tsx
// Dashboard, where you setup your path to success.

import * as React from "react";
import * as Native from "react-native";
import BetterText from "@/components/BetterText";
import BottomNav from "@/components/BottomNav";
import * as Router from "expo-router";
import Section from "@/components/section/Section";
import Division from "@/components/section/division/Division";
import GapView from "@/components/GapView";
import Footer from "@/components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Buttons";
import { termLog } from "./DeveloperInterface";

// TypeScript, supongo
interface Objective {
    days: boolean[];
    duration: number;
    exercise: string;
    extra: {
        amount: number;
        barWeight: number;
        hands: number;
        liftWeight: number;
        lifts: number;
        speed: number;
        time: number;
    };
    id: number;
    repetitions: number;
    restDuration: number;
    rests: number;
    wasDone: boolean;
}

// Creamos los estilos
const styles = Native.StyleSheet.create({
    containerview: {
        width: "100vw" as Native.DimensionValue,
        height: "100vh" as Native.DimensionValue,
    },
    mainview: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        width: "100vw" as Native.DimensionValue,
        height: "100vh" as Native.DimensionValue,
        overflow: "scroll",
    },
});

// Creamos la función
export default function Dashboard() {
    const [loading, setLoading] = React.useState(true);
    const [objectives, setObjectives] = React.useState<{
        [key: string]: Objective;
    } | null>(null);

    React.useEffect(() => {
        const fetchObjectives = async () => {
            try {
                const storedObjectives = await AsyncStorage.getItem("objs");
                if (storedObjectives) {
                    setObjectives(JSON.parse(storedObjectives));
                    termLog("Objectives (OBJS) fetched and parsed!", "success");
                    setLoading(false);
                } else {
                    await AsyncStorage.setItem("objs", JSON.stringify({}));
                    setObjectives({});
                    termLog(
                        "Could not get objectives (OBJS) fetched! Setting them to an empty array ( {} )",
                        "warn"
                    );
                }
            } catch (e) {
                const log =
                    "Could not get objectives (OBJS) fetched due to error: " +
                    e;
                termLog(log, "error");
                if (Native.Platform.OS === "android") {
                    Native.ToastAndroid.show(
                        `Got a React error loading your objectives - ${e}`,
                        Native.ToastAndroid.LONG
                    );
                }
            }
        };

        fetchObjectives();
    }, []);

    const deleteObjective = async (id: number): Promise<void> => {
        try {
            if (objectives !== null) {
                const updatedObjectives: { [key: string]: Objective } = {};
                Object.keys(objectives).forEach(key => {
                    const obj = objectives[key];
                    if (obj.id !== id) {
                        updatedObjectives[key] = obj;
                    }
                });
                await AsyncStorage.setItem(
                    "objs",
                    JSON.stringify(updatedObjectives)
                );

                if (Native.Platform.OS === "android") {
                    Native.ToastAndroid.show(
                        `Deleted objective ${id} successfully!`,
                        Native.ToastAndroid.SHORT
                    );
                }
                setObjectives(updatedObjectives);
                Router.router.replace("/Dashboard");
            } else {
                termLog(
                    "No objectives (OBJS) found - no way to delete.",
                    "warn"
                );
            }
        } catch (e) {
            const log = `Error removing objective, got the following: ${e}`;
            termLog(log, "error");
            if (Native.Platform.OS === "android") {
                Native.ToastAndroid.show(
                    `Got a React error deleting objective ${id} - ${e}`,
                    Native.ToastAndroid.LONG
                );
            }
        }
    };

    const currentpage: string = Router.usePathname();

    if (loading) {
        return (
            <Native.View style={styles.containerview}>
                <BottomNav currentLocation={currentpage} />
                <Native.ScrollView>
                    <Native.View style={styles.mainview}>
                        <BetterText
                            fontWeight="Regular"
                            fontSize={15}
                            textAlign="center"
                            textColor="#C8C8C8"
                        >
                            Loading...
                        </BetterText>
                    </Native.View>
                </Native.ScrollView>
            </Native.View>
        );
    }

    return (
        <Native.View style={styles.containerview}>
            <BottomNav currentLocation={currentpage} />
            <Native.ScrollView style={styles.mainview}>
                <BetterText textAlign="normal" fontWeight="Bold" fontSize={40}>
                    Dashboard
                </BetterText>
                <BetterText
                    textAlign="normal"
                    fontWeight="Regular"
                    fontSize={20}
                >
                    Let&apos;s set up your path to success
                </BetterText>
                <GapView height={20} />
                <Section kind="Objectives">
                    {objectives && Object.keys(objectives).length > 0 ? (
                        Object.keys(objectives).map(key => {
                            const objective = objectives[key];
                            if (!objective) {
                                const log = `Data is undefined for objective with key: ${key}`;
                                termLog(log, "warn");
                                return null;
                            }

                            let descriptionDraft: string =
                                "Duration: " +
                                String(objective.duration) +
                                " minutes. " +
                                String(objective.rests) +
                                " rests and " +
                                String(objective.repetitions) +
                                " repetitions.";
                            if (objective?.rests > 0) {
                                descriptionDraft =
                                    descriptionDraft +
                                    " Rest duration: " +
                                    String(objective.restDuration) +
                                    " minutes.";
                            }

                            const description: string =
                                descriptionDraft +
                                "\nID (just for the app): " +
                                String(objective.id) +
                                ".";

                            return (
                                <Native.View key={objective.id}>
                                    <Division
                                        status="REGULAR"
                                        preheader="ACTIVE OBJECTIVE"
                                        header={objective.exercise}
                                        subheader={description}
                                    >
                                        <Button
                                            style="WOR"
                                            action={() =>
                                                deleteObjective(objective.id)
                                            }
                                            buttonText="Remove"
                                        />
                                    </Division>
                                </Native.View>
                            );
                        })
                    ) : (
                        <Native.View
                            style={{
                                padding: 20,
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BetterText
                                textAlign="center"
                                fontSize={30}
                                textColor="#FFF"
                                fontWeight="Bold"
                            >
                                You don&apos;t have any objectives. Create one
                                now!
                            </BetterText>
                            <GapView height={15} />
                            <Button
                                width="fill"
                                style="ACE"
                                buttonText="Let's go!"
                                action={() =>
                                    Router.router.navigate("/CreateObjective")
                                }
                            />
                        </Native.View>
                    )}
                    {objectives && Object.keys(objectives).length > 0 && (
                        <Native.View
                            style={{
                                padding: 20,
                            }}
                        >
                            <Button
                                width="fill"
                                style="GOD"
                                buttonText="Create active objective"
                                action={() =>
                                    Router.router.navigate("/CreateObjective")
                                }
                            />
                        </Native.View>
                    )}
                </Section>
                <Footer />
            </Native.ScrollView>
        </Native.View>
    );
}
