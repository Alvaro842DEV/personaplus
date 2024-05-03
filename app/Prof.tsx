// Dash.tsx
// Dashboard, where you setup your path to success.

import React, { useState } from "react"
import * as Native from 'react-native';
import BeText from "@/components/Text";
import Foot from "@/components/Foot";
import { usePathname } from "expo-router";
import Section from "@/components/section/Section";
import Division from "@/components/section/division/Division";
import Btn from "@/components/Btns";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Creamos los estilos
const styles = Native.StyleSheet.create({
    mainview: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
    },
    epicspacingdiv: {
        height: 20,
        width: 1
    }
})

// Creamos la función
export default function Prof() {
    let currentpage: string;
    currentpage = usePathname();

    const [uname, setUname] = useState('');
    const handleUnameTxtChange = (txt: string) => {
        setUname(txt);
    };

    const handleUnameBtnClick = async () => {
        try {
            const olduname: any = AsyncStorage.getItem('uname');
            if (olduname !== uname) {
                await AsyncStorage.setItem('uname', uname);
            } else {
                // nothing.
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Native.ScrollView>
            <Native.View style={styles.mainview}>
                <BeText align="normal" weight="Bold" size={40}>Profile</BeText>
                <BeText align="normal" weight="Regular" size={20}>Nice to meet you</BeText>
                <Section kind="REGULAR">
                    <Division status="REGULAR" iconName={null} preheader="USERNAME TEST" header="ENTER YOUR USERNAME" subheader="You need a username, comrade">
                        <Native.TextInput
                            readOnly={false}
                            maxLength={40}
                            placeholder="username here"
                            placeholderTextColor="#C8C8C8"
                            onChangeText={handleUnameTxtChange}
                            value={uname}
                            style={[{ backgroundColor: "white", borderRadius: 10, padding: 10, borderWidth: 2, borderColor: "#000" }]}
                        ></Native.TextInput>
                        <Btn kind={null} onclick={handleUnameBtnClick} text="A"/>
                    </Division>
                </Section>
            </Native.View>
            <Foot page={currentpage}></Foot>
        </Native.ScrollView>
    )
}