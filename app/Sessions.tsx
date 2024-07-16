// Sessions.tsx
// Página para sesiones

import React from "react";
import {
    View,
    StyleSheet,
    Alert,
    ToastAndroid,
    DimensionValue,
    Platform,
    Dimensions,
} from "react-native";
import {
    fetchObjectives,
    markObjectiveAsDone,
    getObjectiveByIdentifier,
} from "@/components/toolkit/objectives";
import { router, useGlobalSearchParams } from "expo-router";
import BetterText from "@/components/BetterText";
import Ionicons from "@expo/vector-icons/MaterialIcons";
import GapView from "@/components/GapView";
import { termLog } from "./DeveloperInterface";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import Button from "@/components/Buttons";

// TypeScript, supongo.
import { Objective } from "@/components/types/Objective";
import { useTranslation } from "react-i18next";

// Estilos
const styles = StyleSheet.create({
    helpcontainer: {
        backgroundColor: "#14171C",
        position: "absolute",
        top: "20%",
        left: 10,
        right: 10,
        bottom: 20,
        overflow: "visible",
        padding: 20,
        borderRadius: 20,
        elevation: 16,
        borderColor: "#26282b",
        borderWidth: 4,
        zIndex: 999,
    },
});

export default function Sessions() {
    const { t } = useTranslation();
    const [loading, setLoading] = React.useState<boolean>(true);
    const params = useGlobalSearchParams();
    const objectiveIdentifier = params.id ? Number(params.id) : null;
    const [objectives, setObjectives] = React.useState<Objective[] | null>(
        null
    );
    const [currentObjective, setCurrentObjective] =
        React.useState<Objective | null>(null);
    // if you wonder why to variables for the timer's loops, one is to keep account of many times repeat (laps) and other is to set the key (required by circle timer)
    const [laps, setLaps] = React.useState<number>(0);
    const [timerKey, setTimerKey] = React.useState<number>(0);

    React.useEffect(() => {
        const handleFetchObjectives = async () => {
            try {
                const objectives = await fetchObjectives("object");
                setObjectives(objectives);
            } catch (e) {
                termLog("LOG 1 (:53) - Fetch error! " + e, "error");
            } finally {
                setLoading(false); // setLoading() in finally and not try, so in case of error the user doesnt get stuck on a Loading... screen
            }
        };

        handleFetchObjectives();
    }, []);

    React.useEffect(() => {
        termLog("LOG 2 (:63) - Objectives: " + objectives, "log");
        termLog(
            "LOG 3 (:64) - Objectives state: " + JSON.stringify(objectives),
            "log"
        );
        termLog("LOG 4 (:68) - Current ID: " + objectiveIdentifier, "log");
    }, [objectives, objectiveIdentifier]);

    React.useEffect(() => {
        if (objectiveIdentifier !== null) {
            const fetchCurrentObjective = async () => {
                try {
                    const objective =
                        await getObjectiveByIdentifier(objectiveIdentifier);
                    setCurrentObjective(objective);
                    setLaps(objective?.repetitions || 0); // Ensure laps is set correctly
                } catch (e) {
                    termLog("Error fetching current objective: " + e, "error");
                }
            };

            fetchCurrentObjective();
        }
    }, [objectiveIdentifier]);

    React.useEffect(() => {
        termLog(
            "LOG 6 (:106) - Current Objective: " +
                JSON.stringify(currentObjective),
            "log"
        );
    }, [currentObjective]);

    let currentObjectiveSustantivizedName: string = "Doing something"; // Default value

    switch (currentObjective?.exercise) {
        case "Meditation":
            currentObjectiveSustantivizedName = "Meditating";
            break;
        case "Push Up":
            currentObjectiveSustantivizedName = "Doing push ups";
            break;
        case "Lifting":
            currentObjectiveSustantivizedName = "Lifting weights";
            break;
        case "Running":
            currentObjectiveSustantivizedName = "Running";
            break;
        case "Walking":
            currentObjectiveSustantivizedName = "Walking";
            break;
        default:
            break;
    }

    const [isTimerRunning, setTimerStatus] = React.useState(true);

    const toggleTimerStatus = (manualTarget?: boolean): void => {
        if (manualTarget !== undefined) {
            setTimerStatus(manualTarget);
        } else {
            setTimerStatus(prevStatus => !prevStatus);
        }
    };

    const timerColor = isTimerRunning ? "#32FF80" : "#FFC832";

    const cancel = () => {
        Alert.alert(
            "Are you sure?",
            "You are doing GREAT! Are you sure you want to give up? Your progress will be lost! (You can always start over if you change your mind)",
            [
                {
                    text: t("globals.nevermind"),
                    style: "cancel",
                },
                {
                    text: "Yes, I give up",
                    style: "destructive",
                    onPress: () => {
                        router.navigate("/"); // basically goes home without saving, easy.
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const sessionCompletedMessages = [
        "Well done, bro!",
        "It was fun, wasn't it?",
        "Bro's actually giving himself a plus, great!",
        "Loved it!",
        "Nothing's funnier than giving yourself a plus, right?",
        "AND HIS NAME HIS JOHN CENA *trumpet plays*", // xD
        "You gave yourself a plus, now give yourself a break",
        "Awesome job, keep it up!",
        "You're on fire!",
        '"Growing myself, one session at a time"',
        "Feeling stronger already! Right?",
        "That was epic!",
        "You're a rockstar!",
        "What else can you achieve?",
        "There's still time for another one ;]",
    ];

    const sessionCompletedMessagesIndex = Math.floor(
        Math.random() * sessionCompletedMessages.length
    );
    const messageForSessionCompleted =
        sessionCompletedMessages[sessionCompletedMessagesIndex];

    const finish = async () => {
        if (currentObjective) {
            try {
                await markObjectiveAsDone(currentObjective.identifier);
                if (Platform.OS === "android") {
                    ToastAndroid.show(
                        messageForSessionCompleted,
                        ToastAndroid.LONG
                    );
                }
                router.navigate("/");
            } catch (e) {
                termLog(
                    "LOG 8 (:176) - Error parsing objectives (OBJS) for update: " +
                        e,
                    "error"
                );
            }
        }
    };

    const doFinish = () => {
        if (laps !== 0) {
            setLaps(prev => (prev > 0 ? prev - 1 : 0));
            setTimerKey(prevKey => prevKey + 1);
        } else {
            finish();
        }
    };

    const [isUserCheckingHelp, setIsUserCheckingHelp] = React.useState(false);

    const toggleHelpMenu = (): void => {
        setIsUserCheckingHelp(prev => !prev);
        toggleTimerStatus(!isUserCheckingHelp);
    };

    let helpText: string = "Help!";

    switch (currentObjective?.exercise.toLowerCase()) {
        case "push up":
            helpText =
                "To do a regular push-up, begin in a plank position with your hands slightly wider than shoulder-width apart. Lower your body by bending your elbows until your chest nearly touches the floor, then push back up to the starting position. Keep your core engaged throughout for stability. Start with a comfortable number of repetitions and gradually increase as you build strength.\n\nTo do a one handed push-up, begin in a plank position with one hand centered beneath your shoulder and the other behind your back. Lower your body by bending your elbow until your chest nearly touches the floor, then push back up. Keep your core tight and maintain balance throughout the movement. Start with a few reps on each side and progress as your strength improves.";
            break;
        case "lifting":
            helpText =
                "Distribute evenly the weights between both hands. For example, if your objective is to lift 6kg, put 3kg to each weight (as you'll lift two weights, one for each hand).\n\nWithout dropping it, extend your arm vertically, and start moving it up and down, making your elbow go from a 90º angle to a 45º angle and then again to a 90º one (that would count as one lift).\n\nKeep going until you do all the lifts specified (or the timer runs out)!";
            break;
        case "running":
            helpText =
                "To start running, ensure you have comfortable running shoes and attire. Begin with a warm-up by walking briskly for 5-10 minutes to prepare your muscles. Start running at a pace that feels comfortable, and maintain a steady breathing pattern. Focus on keeping a good posture and staying relaxed. If you're a beginner, alternate between running and walking in intervals. Gradually increase your running time as your endurance improves. Cool down by walking for a few minutes and then stretching.";
            break;
        case "meditation":
            helpText =
                "Find a quiet and comfortable place to sit or lie down. Close your eyes and take a few deep breaths, focusing on the sensation of the air entering and leaving your body. Begin to observe your thoughts and feelings without judgment, letting them come and go naturally. You can focus on your breath, a mantra, or simply the present moment. If your mind wanders, gently bring your attention back to your focal point. Start with a few minutes and gradually extend your meditation time as you become more comfortable with the practice.";
            break;
        case "walking":
            helpText =
                "Wear comfortable shoes and clothing suitable for the weather. Begin by walking at a natural pace, allowing your arms to swing naturally at your sides. Focus on maintaining a good posture, with your back straight and your head up. You can vary your speed, incorporating brisk walking intervals to increase your heart rate. Walking can be done almost anywhere, so choose a route you enjoy. Aim for at least 30 minutes of walking per session, and gradually increase your duration and intensity as you build stamina.";
            break;
        default:
            helpText = "Error loading help text.";
            break;
    }

    const speedOptions: [string, string][] = [
        ["Brisk Walk", "1.6 - 3.2 km/h"],
        ["Light Jog", "3.2 - 4.0 km/h"],
        ["Moderate Run", "4.0 - 4.8 km/h"],
        ["Fast Run", "4.8 - 5.5 km/h"],
        ["Sprint", "5.5 - 6.4 km/h"],
        ["Fast Sprint", "6.4 - 8.0 km/h"],
        ["Running Fast", "8.0 - 9.6 km/h"],
        ["Very Fast Run", "9.6 - 11.3 km/h"],
        ["Sprinting", "11.3 - 12.9 km/h"],
        ["Fast Sprinting", "12.9 - 14.5 km/h"],
        ["Full Speed Sprinting", "14.5 - 16.1 km/h"],
        ["Maximum Speed", "more than 16.1 km/h"],
    ];

    if (loading) {
        return (
            <View
                style={{
                    width: "100vw" as DimensionValue,
                    height: "100vh" as DimensionValue,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <GapView height={Dimensions.get("screen").height / 2} />
                <BetterText
                    textAlign="center"
                    fontSize={25}
                    textColor="#32FF80"
                    fontWeight="Medium"
                >
                    Loading...
                </BetterText>
            </View>
        );
    }

    if (!currentObjective) {
        return (
            <View>
                <BetterText fontSize={20} fontWeight="Regular">
                    Error
                </BetterText>
            </View>
        );
    }

    return (
        <View
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: 20,
                flex: 1,
                backgroundColor: "#0E1013",
                overflow: "visible",
            }}
        >
            <View
                style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "37.5%",
                }}
            >
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: 20,
                        backgroundColor: "#14171C",
                        borderRadius: 15,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "100%",
                    }}
                >
                    <Ionicons name="play-arrow" size={20} color="#DDDDDD" />
                    <GapView width={10} />
                    <BetterText
                        fontSize={15}
                        fontWeight="Bold"
                        textColor="#DDDDDD"
                    >
                        IN A SESSION!
                    </BetterText>
                </View>
                <GapView height={20} />
                <View
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: 20,
                        backgroundColor: "#14171C",
                        borderRadius: 15,
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                    }}
                >
                    <BetterText
                        fontWeight="Regular"
                        fontSize={12}
                        textAlign="center"
                    >
                        CURRENT OBJECTIVE
                    </BetterText>
                    <GapView height={10} />
                    <BetterText
                        fontWeight="Bold"
                        fontSize={25}
                        textAlign="center"
                    >
                        {currentObjectiveSustantivizedName} for{" "}
                        {currentObjective.duration} minute
                        {currentObjective.duration > 1 && "s"}
                    </BetterText>
                    <GapView height={10} />
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="loop" size={15} color="#FFF" />
                        <GapView width={5} />
                        <BetterText fontWeight="Regular" fontSize={15}>
                            {laps === 0
                                ? "None"
                                : laps === 1
                                  ? `${laps} repetition`
                                  : `${laps} repetitions`}
                        </BetterText>
                        <GapView width={15} />
                        <Ionicons name="snooze" size={15} color="#FFF" />
                        <GapView width={5} />
                        <BetterText fontWeight="Regular" fontSize={15}>
                            {currentObjective.rests === 0
                                ? "None"
                                : currentObjective.rests === 1
                                  ? `${currentObjective.rests} rest of ${currentObjective.restDuration} mins`
                                  : `${currentObjective.rests} rests (${currentObjective.restDuration} mins)`}
                        </BetterText>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {currentObjective.exercise.toLowerCase() ===
                            "lifting" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 10,
                                }}
                            >
                                <Ionicons
                                    name="keyboard-double-arrow-down"
                                    size={15}
                                    color="#FFF"
                                />
                                <GapView width={5} />
                                <BetterText
                                    fontWeight="Regular"
                                    textColor="#FFF"
                                    fontSize={15}
                                >
                                    {currentObjective?.extra?.barWeight !==
                                        undefined &&
                                    currentObjective?.extra?.liftWeight !==
                                        undefined &&
                                    currentObjective.extra.hands !== undefined
                                        ? String(
                                              currentObjective.extra.barWeight +
                                                  currentObjective.extra
                                                      .liftWeight *
                                                      currentObjective.extra
                                                          .hands
                                          )
                                        : "N/A"}{" "}
                                    kg
                                </BetterText>
                                <GapView width={10} />
                                <Ionicons
                                    name="change-circle"
                                    size={15}
                                    color="#FFF"
                                />
                                <GapView width={5} />
                                <BetterText
                                    fontWeight="Regular"
                                    textColor="#FFF"
                                    fontSize={15}
                                >
                                    {currentObjective?.extra?.lifts !==
                                    undefined
                                        ? String(currentObjective.extra.lifts)
                                        : "N/A"}{" "}
                                    lifts
                                </BetterText>
                                <GapView width={10} />
                                <Ionicons
                                    name="front-hand"
                                    size={15}
                                    color="#FFF"
                                />
                                <GapView width={5} />
                                <BetterText
                                    fontWeight="Regular"
                                    textColor="#FFF"
                                    fontSize={15}
                                >
                                    {currentObjective?.extra?.hands !==
                                    undefined
                                        ? String(currentObjective.extra.hands)
                                        : "N/A"}{" "}
                                    hand
                                </BetterText>
                            </View>
                        )}
                        {currentObjective.exercise.toLowerCase() ===
                            "running" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 10,
                                }}
                            >
                                <Ionicons name="speed" size={15} color="#FFF" />
                                <GapView width={5} />
                                <BetterText
                                    fontWeight="Regular"
                                    textColor="#FFF"
                                    fontSize={15}
                                >
                                    {currentObjective.extra.speed !==
                                        undefined &&
                                    currentObjective.extra.speed >= 0 &&
                                    currentObjective.extra.speed <
                                        speedOptions.length
                                        ? String(
                                              speedOptions[
                                                  currentObjective.extra.speed
                                              ][1]
                                          )
                                        : "N/A"}
                                </BetterText>
                            </View>
                        )}
                        {currentObjective.exercise.toLowerCase() ===
                            "push up" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 10,
                                }}
                            >
                                <Ionicons
                                    name="repeat"
                                    size={15}
                                    color="#FFF"
                                />
                                <GapView width={5} />
                                <BetterText
                                    fontWeight="Regular"
                                    textColor="#FFF"
                                    fontSize={15}
                                >
                                    {currentObjective?.extra?.amount !==
                                    undefined
                                        ? String(currentObjective.extra.amount)
                                        : "N/A"}{" "}
                                    push-ups
                                </BetterText>
                                <GapView width={10} />
                                <Ionicons
                                    name="front-hand"
                                    size={15}
                                    color="#FFF"
                                />
                                <GapView width={5} />
                                <BetterText
                                    fontWeight="Regular"
                                    textColor="#FFF"
                                    fontSize={15}
                                >
                                    {currentObjective?.extra?.hands !==
                                    undefined
                                        ? String(currentObjective.extra.hands)
                                        : "N/A"}{" "}
                                    hand
                                </BetterText>
                            </View>
                        )}
                    </View>
                </View>
                <GapView height={20} />
                <CountdownCircleTimer
                    key={timerKey}
                    duration={currentObjective.duration * 60}
                    size={160}
                    isPlaying={isTimerRunning}
                    colors={[
                        timerColor === "#32FF80" ? "#32FF80" : "#FFC832",
                        timerColor === "#32FF80" ? "#32FF80" : "#FFC832",
                    ]}
                    colorsTime={[15, 5]}
                    isSmoothColorTransition={false}
                    onComplete={doFinish}
                    isGrowing={true}
                    trailColor="#202328"
                    strokeLinecap="round"
                    trailStrokeWidth={10}
                    strokeWidth={15}
                >
                    {({ remainingTime }) => (
                        <BetterText
                            fontSize={30}
                            fontWeight="Bold"
                            textAlign="center"
                            textColor={timerColor}
                        >
                            {remainingTime}
                        </BetterText>
                    )}
                </CountdownCircleTimer>
                <GapView height={20} />
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: 20,
                        backgroundColor: "#14171C",
                        borderRadius: 15,
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                    }}
                >
                    <Button
                        style={isTimerRunning ? "ACE" : "HMM"}
                        action={() => setTimerStatus(prev => !prev)}
                        layout="box"
                    >
                        <Ionicons
                            name={isTimerRunning ? "pause" : "play-arrow"}
                            size={16}
                            color={isTimerRunning ? "#FFF" : "#000"}
                        />
                    </Button>
                    <GapView width={10} />
                    <Button style="GOD" action={finish} layout="box">
                        <Ionicons name="check" size={16} color="#000" />
                    </Button>
                    <GapView width={10} />
                    <Button
                        style="HMM"
                        buttonText="Help?"
                        action={() => toggleHelpMenu()}
                        layout="normal"
                        height="default"
                        width="fill"
                    />
                    <GapView width={10} />
                    <Button
                        style="WOR"
                        buttonText="Give up"
                        action={cancel}
                        layout="normal"
                        height="default"
                        width="fill"
                    />
                </View>
            </View>
            {isUserCheckingHelp && (
                <View style={styles.helpcontainer}>
                    <BetterText fontSize={18} fontWeight="Regular">
                        Help with {currentObjectiveSustantivizedName}
                    </BetterText>
                    <BetterText fontSize={14} fontWeight="Light">
                        {helpText}
                    </BetterText>
                    <GapView height={10} />
                    <Button
                        layout="fixed"
                        height="default"
                        style="ACE"
                        buttonText="Got it"
                        action={toggleHelpMenu}
                    />
                    <GapView height={10} />
                    <BetterText
                        fontSize={10}
                        fontWeight="Light"
                        textColor="#C8C8C8"
                        textAlign="center"
                    >
                        Psst... Don&apos;t worry, the timer has been paused so
                        you can read!
                    </BetterText>
                </View>
            )}
        </View>
    );
}
