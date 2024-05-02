import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import BeText from "./Text";

// TypeScript, supongo
interface SectionProps {
    page: string;
}

// Definimos los estilos
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#16191E",
        display: 'flex',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 30,
        paddingBottom: 30,
        // NOTA: No sé por qué, pero VSCode me marca aquí un error. Eso no pasaba con JS. Además, ahora ya no funciona (sin TS si lo hacía). Extraño...
        // position: "fixed",
        bottom: 0,
        left: 0,
        right: 0
    },
    icon: {
        width: 40,
        height: 40
    }
});


// Creamos la función del componente
export default function Foot({ page }: SectionProps) {
    const [currentPage, setCurrentPage] = useState<string>(page);

    // Define la función para manejar el cambio de página
    const handlePageChange = (newPage: string) => {
        setCurrentPage(newPage);
    };

    return (
        <View style={styles.container}>
            <Link href="/" onPress={() => handlePageChange("/")}>
                <BeText weight="Bold" size={12} color={currentPage === "/" ? "#FFF" : "#8A8C8E"}>
                    Home
                </BeText>
            </Link>
            <Link href="/Dash" onPress={() => handlePageChange("/Dash")}>
                <BeText weight="Bold" size={12} color={currentPage === "/Dash" ? "#FFF" : "#8A8C8E"}>
                    Dash
                </BeText>
            </Link>
            <Link href="/Prof" onPress={() => handlePageChange("/Prof")}>
                <BeText weight="Bold" size={12} color={currentPage === "/Prof" ? "#FFF" : "#8A8C8E"}>
                    Profile
                </BeText>
            </Link>
        </View>
    );
}