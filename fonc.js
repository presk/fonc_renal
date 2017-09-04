/**
 * @author Keven Presseau-St-Laurent <presseauk@gmail.com>
 */

function resetFields() {
    document.getElementById("calculator").reset();
    //document.getElementById("IMC").innerHTML = "";
    //document.getElementById("iWeight").innerHTML = "";
    document.getElementById("aWeight").innerHTML = "";
			}
function calc() {
    var age = parseFloat(document.getElementById("age").value) || 0;
    var radios = document.getElementsByName("gender");                  //temp value to cycle through the radio inputs
    var gender = "n";
    for (var i = 0, length = radios.length; i < length; i++) {          //Cycles to check if a radio is checked
        if (radios[i].checked) {
            gender = radios[i].value;
            break;
        }
    }
    var height = parseFloat(document.getElementById("height").value) || 0;
    var weight = parseFloat(document.getElementById("weight").value) || 0;
    var afric = "n";
    var radios = document.getElementsByName("origin");
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            afric = radios[i].value;
            break;
        }
    }
    var IDMS = "n";
    var radios = document.getElementsByName("IDMS");
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            IDMS = radios[i].value;
            break;
        }
    }
    var creat = parseFloat(document.getElementById("creat").value) || 0;
    var CG = parseFloat(document.getElementById("CG").value) || 0;
    var MDRD = parseFloat(document.getElementById("MDRD").value) || 0;
    var CKDEPI = parseFloat(document.getElementById("CKDEPI").value) || 0;
    var count = 0;
    //Checks how many fields have data, if theres is more or less than one and error is thrown
    if (CG != 0)
        count += 1;
    if (MDRD != 0)
        count += 1;
    if (creat != 0)
        count += 1;
    if (CKDEPI != 0)
        count += 1;
    if (count != 1) {
        alert("Svp entrer soit la creatinine, Cockroft-Gault, MDRD ou CKD-EPI");
        return;
    }
        
    //Checks to see if the user entered a valid age
    if (age == 0) {
        alert("Svp entrer un âge valide");
        return;
    }  
    //Checks to see if the user chose a sex
    if((gender == "n")){
        alert("Svp choisir un sexe");
        return;
    }       
    //If creatinine has data calculate CG(if possible) and MDRD 
    if (creat != 0){
        if(weight !=0  && height != 0)
            calcCG(creat, age, gender, weight, height);
        else {
            alert("Le poids et la taille est nécessaire pour calculer Cockroft-Gault");
        }
        calcMDRD(creat, age, gender, afric, IDMS); 
        calcCKDEPI(creat, age, gender, afric);
    }
    //Else if CG has data AND weight AND height have data find the resulting creatinine and calculate MDRD    
    else if(CG !=0)
    {
        if (weight != 0 && height != 0)
            alert("Le poids et la taille est nécessaire pour calculer Cockroft-Gault");
        else {
            creat = creatFromCG(CG, age, gender, weight, height);
            document.getElementById("creat").value = round2d(creat);
            calcMDRD(creat, age, gender, afric, IDMS);
            calcCKDEPI(creat, age, gender, afric);
        } 
    }
    //Else if MDRD has data find the resulting creatinine and calculate CG if weight and height are entered
    else if(MDRD !=0)
    {
        creat = creatFromMDRD(MDRD, age, gender, afric, IDMS);
        document.getElementById("creat").value = round2d(creat);
        if (weight != 0 && height != 0)
            calcCG(creat, age, gender, weight, height);
        else {
            alert("Le poids et la taille est nécessaire pour calculer Cockroft-Gault");
        }
        calcCKDEPI(creat, age, gender, afric);
    }
    else if (CKDEPI != 0) {
        alert("Aucune conversion de CKDEPI à Creatinine");
        /*creat = creatFromCKDEPI(CKDEPI, age, gender, afric);
        document.getElementById("creat").value = round2d(creat);
        if (weight != 0 && height != 0)
            calcCG(creat, age, gender, weight, height);
        else {
            alert("Le poids et la taille est necessaire pour calculer Cockroft-Gault");
        }
        calcMDRD(creat, age, gender, afric);*/
    }
}
/**Calculates the IMC : weight(kg)/height(m)^2*/
function calcIMC(weight, height) {
    var imc = weight / ((height / 100) * (height / 100));
    //var rimc = round2d(imc);
    //document.getElementById("IMC").innerHTML = "IMC: " + rimc;
    return imc;
}
/**Calculates whether to use the adjusted weight or regular weight and returns it*/
function calcWeight(weight, gender, height) {
    var imc = calcIMC(weight, height);
    var idealWeight;
    if (gender == "f")
        idealWeight = 45 + 0.92 * (height - 152);
    else if (gender == "m")
        idealWeight = 50 + 0.92 * (height - 152);
    //document.getElementById("iWeight").innerHTML = "Poids idéal: " + idealWeight;
    //If the IMC is bigger than 30 or the weight is over 30% more than the ideal weight use the adjusted weight
    if (imc >= 30 || weight >= 1.3 * idealWeight) {
        var w = idealWeight + 0.4 * (weight - idealWeight);
        var rw = round2d(w) + "kg";
        document.getElementById("aWeight").innerHTML = "Poids ajusté: " + rw;
        return w;
    }  
    else
        return weight;
}
/**Calculates CG using adjusted weight if necessary. CG: (140 - age) * weight(kg) * gender-coefficient / creatinine*/
function calcCG(creat, age, gender, weight, height) {
    var w = calcWeight(weight, gender, height);
    var z;
    if (gender == "f")
        z = 1.04;
    else if (gender == "m")
        z = 1.23;

    document.getElementById("CG").value = round2d((140 - age) * w * z / creat);
}
/**Calculates MDRD: 186 * sex-coefficient * race-coefficient * IDMS-coefficient * (creatinine*0.0113)^-1.154 * age^-0.203*/
function calcMDRD(creat, age, gender, afric, IDMS) {
    var z = 1;
    var r = 1;
    var i = 1;
    if (gender == "f")
        z = 0.72;
    if (afric == "y")
        r = 1.212;
    if (IDMS == "y")
        i = 0.92;
    document.getElementById("MDRD").value = round2d(186 * z * r * i * Math.pow((creat * 0.0113), -1.154) * Math.pow(age, -0.203));
}
function calcCKDEPI(creat, age, gender, afric) {
    var z = 1;
    var r = 1;
    var a = -0.411;
    var k = 0.9 * 88.4;
    if (gender == "f")
    {
        z = 1.018;
        a = -0.329;
        k = 0.7 * 88.4;
    }
    if (afric == "y")
        r = 1.159;
    var min = Math.min(creat / k, 1);
    var max = Math.max(creat / k, 1);
    var t = 141 * Math.pow(min, a) * Math.pow(max, -1.209) * Math.pow(0.993, age) * z * r;
    document.getElementById("CKDEPI").value = round2d(t);
}
/**Calculates and returns the creatinine from the CG calculation: (140 - age) * weight(kg) * gender-coefficient / CG*/
function creatFromCG(CG, age, gender, weight, height) {
    var w = calcWeight(weight, gender, height);
    var z;
    if (gender == "f")
        z = 1.04;
    else if (gender == "m")
        z = 1.23;
    return (140 - age) * w * z / CG;
}
/**Calculates and returns the creatinine from the MDRD calculation: MDRD / (186 * sex-coefficient * race-coefficient * IDMS-coefficient * age^-0.203)^-1/1.154 * 0.0113*/
function creatFromMDRD(MDRD, age, gender, afric, IDMS) {
    var z = 1;
    var r = 1;
    var i = 1;
    if (gender == "f")
        z = 0.742;
    if (afric == "y")
        r = 1.212;
    if (IDMS == "y")
        i = 0.92;
    var ss = MDRD / (186 * z * r * i * Math.pow(age, -0.203));
    return Math.pow(ss, -1/1.154)/0.0113;
}
/**Rounds a value to its 2nd decimal*/
function round2d(value) {
    return Number(Math.round(value + 'e' + 2) + 'e-' + 2);
}
	