// index.tsx
// Welcome to PersonaPlus. Give yourself a plus!

import * as React from "react";
import * as Native from "react-native";
import BetterText from "@/components/BetterText";
import Section from "@/components/section/Section";
import BottomNav from "@/components/BottomNav";
import * as Router from "expo-router";
import Division from "@/components/section/division/Division";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Buttons";
import GapView from "@/components/GapView";
import Footer from "@/components/Footer";
import { termLog } from "@/app/DeveloperInterface";
// import useNotification from "@/components/hooks/useNotification";
import * as Notification from "expo-notifications";

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

interface NotificationIdentifier {
    identifier: string;
}

const scheduledNotifications: NotificationIdentifier[] = [];

const scheduleRandomNotifications = async () => {
    const notificationMessages = [
        "You know you got stuff to do!",
        "Daily objective means DAILY objective - go and do it!",
        "Time to give yourself a plus!",
        "You said you wanted to give yourself a plus - get up!",
        "The only difference between us and a regular task list? We're way more fun to check!",
        "I'm like your mom: I won't stop till' you make it.",
        "Give yourself a plus before, mute your phone after.",
        "The only notification that doesn't make you waste time.",
        "No, not another TikTok notification this time. Move your body!",
        "They're called 'objectives' for a reason: you have to accomplish them!",
        "No, I won't stop sending notifications until you stop ignoring your path to success",
        "Trust me, you'll feel better later.",
        "Just one more session pls, love u <3",
        "You downloaded this app for a reason. Don't give it up.",
        "It's that time again!",
    ];

    // const randomDelay = () => Math.floor(Math.random() * 30) * 1000;
    const randomDelay = () => (Math.floor(Math.random() * 1800) + 1800) * 1000;
    // for testing: uncomment 1st and comment 2nd line
    // for production: the opposite (comment 1st and uncomment 2nd line)
    // 1st one is a random interval of 0-29 seconds between random notification
    // 2nd one is also a random interval, but of 30-60 minutes, so it's not annoying for the end user

    for (let i = 0; i < 2; i++) {
        const randomMessage =
            notificationMessages[
                Math.floor(Math.random() * notificationMessages.length)
            ];
        const trigger = {
            hour: Math.floor(Math.random() * 12) + 11,
            minute: Math.floor(Math.random() * 60),
            repeats: true,
        };

        const identifier = await Notification.scheduleNotificationAsync({
            content: {
                title: "Pending PersonaPlus objectives!",
                body: randomMessage,
            },
            trigger,
        });

        // Store the notification identifier
        scheduledNotifications.push({ identifier });

        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        console.log(scheduledNotifications);
        console.log("Scheduled Notis ENABLED");
    }
};

// Function to cancel scheduled notifications
const cancelScheduledNotifications = async () => {
    for (const { identifier } of scheduledNotifications) {
        await Notification.cancelScheduledNotificationAsync(identifier);
    }

    scheduledNotifications.length = 0;
    console.log(scheduledNotifications);
    console.log("Scheduled Notis DISABLED");
};

// Creamos la función
export default function Home() {
    const [loading, setLoading] = React.useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(
        null
    );
    const [username, setUsername] = React.useState<string>("Unknown");
    const [objectives, setObjectives] = React.useState<{
        [key: string]: Objective;
    } | null>(null);

    React.useEffect(() => {
        const multiFetch = async () => {
            const items = await AsyncStorage.multiGet([
                "username",
                "objs",
                "hasLaunched",
            ]);
            if (items) {
                setUsername(String(items[0][1]));
                setObjectives(JSON.parse(String(items[1][1])));
                const hasLaunchedValue = items[2][1];
                if (hasLaunchedValue === null || !hasLaunchedValue) {
                    await AsyncStorage.setItem("hasLaunched", "true");
                    setIsFirstLaunch(true);
                } else {
                    setIsFirstLaunch(false);
                }
                setLoading(false);
            } else {
                termLog("Fetch error!", "error");
                setUsername("Unknown");
                setObjectives(JSON.parse("{}"));
                setLoading(false);
            }
        };

        multiFetch();
    }, []);

    const currentpage: string = Router.usePathname();

    if (isFirstLaunch) {
        Router.router.push("/WelcomeScreen");
    }

    const createNewActiveObjective = (): void => {
        Router.router.navigate("/CreateObjective");
    };

    const startSessionFromObjective = (id: number): void => {
        Router.router.navigate("/Sessions?id=" + id);
    };

    console.log(objectives);

    const markObjectiveAsDone = async (id: number): Promise<void> => {
        try {
            if (objectives !== null) {
                try {
                    if (Array.isArray(objectives)) {
                        const updatedObjectives = [...objectives];

                        const objectiveIndex = updatedObjectives.findIndex(
                            objective => objective.id === id
                        );

                        if (objectiveIndex !== -1) {
                            updatedObjectives[objectiveIndex] = {
                                ...updatedObjectives[objectiveIndex],
                                wasDone: true,
                            };

                            const updatedObjectivesObject =
                                updatedObjectives.reduce(
                                    (acc, objective) => {
                                        acc[objective.id] = objective;
                                        return acc;
                                    },
                                    {} as { [key: number]: Objective }
                                );

                            try {
                                await AsyncStorage.setItem(
                                    "objs",
                                    JSON.stringify(updatedObjectivesObject)
                                );

                                setObjectives(updatedObjectivesObject);

                                termLog(
                                    "Objectives (OBJS) updated and saved successfully!",
                                    "success"
                                );

                                Router.router.replace("/");
                            } catch (e) {
                                const log = `Could not save objectives (OBJS) to AsyncStorage: ${e}`;
                                termLog(log, "error");
                            }
                        } else {
                            termLog(
                                `Objective with id ${id} not found!`,
                                "error"
                            );
                        }
                    } else {
                        termLog("Objectives is not an array!", "error");
                        console.log(objectives);
                    }
                } catch (e) {
                    const log = `Could not process objectives array: ${e}`;
                    termLog(log, "error");
                }
            } else {
                termLog("Objectives is null!", "error");
            }
        } catch (e) {
            const log = `Could not update objectives (OBJS) due to error: ${e}`;
            termLog(log, "error");
        }
    };

    // i got creative :]
    // commits / PRs that add more stuff will of course be taken into account
    const allDoneMessages = [
        "Feel proud of yourself, don't you?",
        "That is right, you have completed ALL of your objectives for today.",
        "Now plan something else and make this day even more productive!",
        '"Giving yourself a PLUS" seems to be worth it, right?',
        "Take a moment to celebrate your accomplishments!",
        "All tasks checked off! Well done, keep up the momentum.",
        "Another productive day in the books. Great job!",
        "Mission accomplished! What's next on your list?",
        "mission passed, + respect",
        "Seriously. You did it.",
        "Not enough? You can go to your dashboard and add something else.",
        "Who could tell a phone app could help you get so much done?",
        "while (motivated) do\nGiveYourselfAPlus()",
        "You're defo on ur prime",
        "add objective -> acomplish it -> feel good -> repeat",
        "bro finally got out his cave", // lmao
        "Enough for today. More tomorrow!",
        "For today; objectives due tomorrow aren't shown ;)",
    ];

    const randomMessageIndex = Math.floor(
        Math.random() * allDoneMessages.length
    );
    const randomMessageForAllDone = allDoneMessages[randomMessageIndex];

    // Today's date (since React for some reasons thinks it's funny to start weeks on Sunday, this needs to be done)
    const today = new Date().getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    // Adjust today index to match week start (Monday as 0)
    const adjustedToday = today === 0 ? 6 : today - 1; // Adjust Sunday to index 6, otherwise shift back by one

    if (objectives && Object.keys(objectives).length > 0) {
        const allObjectivesHandled = Object.keys(objectives).every(key => {
            const objective = objectives[key];
            return (
                objective.wasDone ||
                !objective.days ||
                !objective.days[adjustedToday]
            );
        });

        if (!allObjectivesHandled) {
            if (Native.Platform.OS === "android") {
                scheduleRandomNotifications();
            }
        } else {
            if (Native.Platform.OS === "android") {
                cancelScheduledNotifications();
            }
        }
    }

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
                    Hello, {username}!
                </BetterText>
                <BetterText
                    textAlign="normal"
                    fontWeight="Regular"
                    fontSize={20}
                >
                    This is your summary for today
                </BetterText>
                <GapView height={20} />
                <Section kind="Objectives">
                    {objectives && Object.keys(objectives).length > 0 ? (
                        Object.keys(objectives).every(
                            key =>
                                objectives[key].wasDone ||
                                !objectives[key].days ||
                                !objectives[key].days[adjustedToday]
                        ) ? (
                            <Native.View
                                style={{
                                    padding: 20,
                                    flex: 1,
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
                                    You&apos;ve done everything!
                                </BetterText>
                                <GapView height={10} />
                                <BetterText
                                    textAlign="center"
                                    fontSize={15}
                                    textColor="#FFF"
                                    fontWeight="Regular"
                                >
                                    {randomMessageForAllDone}
                                </BetterText>
                            </Native.View>
                        ) : (
                            Object.keys(objectives).map(key => {
                                const obj = objectives[key];
                                termLog(
                                    `OBJ ${obj.id}, days[${adjustedToday}]: ${obj.days[adjustedToday]}`,
                                    "log"
                                );

                                if (
                                    obj &&
                                    !obj.wasDone &&
                                    obj.days[adjustedToday]
                                ) {
                                    return (
                                        <Division
                                            key={obj.id}
                                            status="REGULAR"
                                            preheader="ACTIVE OBJECTIVE"
                                            header={obj.exercise}
                                        >
                                            <Button
                                                style="ACE"
                                                action={() =>
                                                    startSessionFromObjective(
                                                        obj.id
                                                    )
                                                }
                                                buttonText="Let's go!"
                                            />
                                            <Button
                                                style="GOD"
                                                action={() =>
                                                    markObjectiveAsDone(obj.id)
                                                }
                                                buttonText="Already done it"
                                            />
                                        </Division>
                                    );
                                }
                                return null;
                            })
                        )
                    ) : (
                        <Native.View
                            style={{
                                padding: 20,
                                flex: 1,
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
                                action={createNewActiveObjective}
                            />
                        </Native.View>
                    )}
                </Section>
                <GapView height={20} />
                {objectives && Object.keys(objectives).length > 0 && (
                    <Section kind="HowYouAreDoing">
                        <GapView height={20} />
                        <BetterText
                            fontWeight="Regular"
                            textColor="#32FF80"
                            fontSize={25}
                            textAlign="center"
                        >
                            Coming soon!
                        </BetterText>
                        <Native.View style={{ padding: 20 }}>
                            <BetterText
                                fontWeight="Regular"
                                fontSize={15}
                                textAlign="center"
                            >
                                PersonaPlus is still a work-in-progress app.
                                {"\n\n"}
                                On later updates you&apos;ll be able to see here
                                many stats and helpful info. Be sure to check
                                for updates every few weeks!
                            </BetterText>
                        </Native.View>
                    </Section>
                )}
                <Footer />
            </Native.ScrollView>
        </Native.View>
    );
}
