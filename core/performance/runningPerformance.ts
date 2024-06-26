/*
CALCULATE RUNNING / WALKING PERFORMANCE
*/

// LAST UPDATE TO THIS FUNCTION, ITS DATA, ITS CALCULATIONS, OR ANYTHING THAT DOES AFFECT THE RESULT
// Changes that do not affect the result, like just bug-fixes, performance improvments, code-legibility improvments, or that kind of stuff, do not need to bump the date.
const UPDATED: string = "26/06/2024";
// ANY SOURCE THAT HAS BEEN USED TO DEVELOP THE CALCULATIONS / DATA PROVIDED or that BACKS IT UP.
const SOURCE: string = "https://downhilltodowntown.com/how-to-calculate-your-caloric-burn-while-running/ and https://scielo.isciii.es/scielo.php?script=sci_arttext&pid=S0212-16112012000400040 and https://eresdeportista.com/salud/como-calcular-calorias-quemadas-ejercicio/ and https://www.topendsports.com/weight-loss/energy-met.htm andhttps://journals.lww.com/acsm-msse/fulltext/2000/09001/compendium_of_physical_activities__an_update_of.9.aspx and https://www.cmu.edu/common-cold-project/measures-by-study/health-practices/physical-activity/index.html";

export function getSource() {
    return SOURCE;
}

export function getLastUpdate() {
    return UPDATED;
}

interface RUNNING_WALKING_Response {
    result: number;
    subject?: {
        age: number;
        gender: "male" | "female";
        weight: number;
        height: number;
        speed: number;
        time: number;
    };
    context?: string;
    explanation?: string;
}

/**
 * Calculate the calories burnt during running or walking based on given parameters.
 * @param age The age of the subject.
 * @param gender The gender of the subject (either "male" or "female").
 * @param weight The weight of the subject in kilograms (KG).
 * @param height The height of the subject in centimeters (CM).
 * @param speed The speed in KM/h the subject was running to.
 * @param time The duration in HOURS of the exercise performed by the subject.
 * @param provideContext Whether to provide a brief contextualization about the result.
 * @param provideExplanation Whether to provide a detailed explanation about what the calculation means.
 * @returns The calories burnt if neither provideContext nor provideExplanation are true, otherwise returns a RUNNING_WALKING_Response object.
*/

export function calculateRunningOrWalkingPerformance(
    age: number,
    gender: "male" | "female",
    weight: number,
    height: number,
    speed: number,
    time: number,
    provideContext?: boolean,
    provideExplanation?: boolean
): RUNNING_WALKING_Response {
    let mets: number | null; // MET - Metabolic Equivalent of Task

    // Assign METs based on speed in km/h
    if (speed > 1.6092 && speed < 3.2181) {
        mets = 2;
    } else if (speed >= 3.2181 && speed <= 4.023) {
        mets = 2.5;
    } else if (speed > 4.023 && speed <= 4.8276) {
        mets = 3.5;
    } else if (speed > 4.8276 && speed <= 5.51) {
        mets = 4;
    } else if (speed > 5.51 && speed <= 6.44) {
        mets = 5;
    } else if (speed > 6.44 && speed <= 8.05) {
        mets = 6;
    } else if (speed > 8.05 && speed <= 9.65) {
        mets = 8;
    } else if (speed > 9.65 && speed <= 11.27) {
        mets = 10;
    } else if (speed > 11.27 && speed <= 12.87) {
        mets = 11;
    } else if (speed > 12.87 && speed <= 14.48) {
        mets = 11.5;
    } else if (speed > 14.48 && speed <= 16.09) {
        mets = 12.5;
    } else if (speed > 16.09) {
        mets = 16;
    } else {
        mets = null;
    }

    // Constant factor for calories burnt calculation
    const caloriesBurntPerKgPerHour = 0.075 * 4.3;

    // Calculate calories burnt
    let caloriesBurnt: number

    if (mets) {
        caloriesBurnt = mets * caloriesBurntPerKgPerHour * weight * time;
    } else {
        caloriesBurnt = 0 // if mets is not calculable, it returns 0.
    }

    const response: RUNNING_WALKING_Response = {
        result: caloriesBurnt,
    };

    if (provideContext) {
        response.subject = {
            age,
            gender,
            weight,
            height,
            speed,
            time,
        };
        response.context = "The context provides additional details about the subject's profile and exercise parameters.";
    }

    if (provideExplanation) {
        response.explanation = "The performance can be measured in burnt calories, which are obtained by calculating the time spent on the exercise, the subject's weight, and the Metabolic Equivalent of Task (MET).";
    }

    return response;
}
