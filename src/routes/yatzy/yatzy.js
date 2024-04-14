let players = 5;
const allPlayers = ["P1", "P2", "P3", "P4", "P5"];
let actPlayers = [];
let whosTurn = document.getElementById("whosTurn")
let turn = 0;
let finalSum = []
let sum;
let dices = []
let placed = 0;
let rollbtn = document.getElementById("roll")
rollbtn.disabled = true;
for (i = 1; i < 6; i++) {
    document.getElementById("P" + i).checked = true
}
let color = ["#555", "#990000", "#ff1900", "#ffa200", "#d4ff00", "#00ff2a"]
let diceIcons = [" ", "one", "two", "three", "four", "five", "six"]
let diceKept = ["", false, false, false, false, false]
let started = false;


function hold(dice) {
    if (started == true && x != 0) {
        if (diceKept[dice] == false) {
            diceKept[dice] = true
            document.getElementById("die" + dice).style.backgroundColor = "red"
        }
        else {
            diceKept[dice] = false
            document.getElementById("die" + dice).style.backgroundColor = "white"
        }
    }

}

function start() {
    let n = 0
    started = true
    rollbtn.disabled = false;
    document.getElementById("start").disabled = true;
    for (let i = 1; i <= 5; i++) {
        if (document.getElementById("P" + i).checked == false) {
            players--;

            var elements = document.getElementsByClassName("P" + i);
            for (var x = 0; x < elements.length; x++) {
                elements[x].style.backgroundColor = "black";
            }

        }
        else {
            newPlayer = allPlayers.slice((i - 1), (i));
            actPlayers.splice(i - 1, 0, newPlayer);
            finalSum.splice(0, 0, 0)

        }
        document.getElementsByClassName("sum" + " " + "P" + i)[0].innerHTML = 0;
    }
    whosTurn.innerHTML = actPlayers[turn] + " sin tur"
    actPlayers[turn]
}




let x = 0
function rollDice() {
    x++
    for (let i = 1; i <= 5; i++) {

        if (diceKept[i] == false) {
            let roll = Math.floor(Math.random() * 6) + 1;
            document.getElementById("die" + i).innerHTML = "<i class='fa-solid fa-dice-" + diceIcons[roll] + " fa-4x'" + " onclick='hold(" + i + ");'" + "></i>"
            dices[i - 1] = roll;
        }
    }
    if (x >= 3) {
        rollbtn.disabled = true;
        x = 0
    }
}

//let sumPlacer = document.getElementsByClassName("sum" + " " + actPlayers[turn]);

function enTilSeks(where, num, helu) {
    sum = 0;

    //let score = document.getElementsByClassName(where + actPlayers[i])
    for (i = 0; i < 5; i++) {
        finalRoll = dices[i]

        if (finalRoll == num) {
            sum += finalRoll;
        }
    }
    /*
    console.log(actPlayers[turn])
    finalSum.splice(actPlayers[turn], actPlayers[turn], (finalSum[actPlayers[turn]]+sum))
    console.log(finalSum[0])
    */
    if (helu == "hover") {
        document.getElementsByClassName("ttt" + " " + where)[0].innerHTML = sum

        if (sum == 0) {
            document.getElementsByClassName("ttt" + " " + where)[0].style.backgroundColor = color[0]
        }
        if (sum == num) {
            document.getElementsByClassName("ttt" + " " + where)[0].style.backgroundColor = color[1]
        }
        if (sum == num * 2) {
            document.getElementsByClassName("ttt" + " " + where)[0].style.backgroundColor = color[2]
        }
        if (sum == num * 3) {
            document.getElementsByClassName("ttt" + " " + where)[0].style.backgroundColor = color[3]
        }
        if (sum == num * 4) {
            document.getElementsByClassName("ttt" + " " + where)[0].style.backgroundColor = color[4]
        }
        if (sum == num * 5) {
            document.getElementsByClassName("ttt" + " " + where)[0].style.backgroundColor = color[5]
        }

    }
    else {
        place(where, sum)
    }
}
let idfk;
function place(where, score) {
    let idkk = where + " " + actPlayers[turn];
    idfk = document.getElementsByClassName(idkk);
    finalSum[turn] += score

    if (idfk[0].innerHTML == "") {
        idfk[0].innerHTML = score;
        if (where == "enere" || where == "toere" || where == "treere" || where == "firere" || where == "femere" || where == "seksere") {
            sumPlacer = document.getElementsByClassName("sum" + " " + actPlayers[turn])
            previousSum = sumPlacer[0].innerHTML;
            sumPlacer[0].innerHTML = Number(previousSum) + sum;
            if (sumPlacer[0].innerHTML > 50) {
                console.log("bonus")

                document.getElementsByClassName("bonus" + " " + actPlayers[turn])[0].innerHTML = 50;
            }
        }

        if (turn == (actPlayers.length - 1)) {
            turn = 0;
        }
        else {
            turn++;
        }

        for (i = 1; i <= 5; i++) {
            document.getElementById("die" + i).innerHTML = "";
            diceKept[i] = false;
            document.getElementById("die" + i).style.backgroundColor = "white"
        }
        rollbtn.disabled = false;
        whosTurn.innerHTML = actPlayers[turn] + " sin tur"
        x = 0
        placed++
        if (placed == 15 * players) {
            alert("Game over")
        }
    }
}


let ettpar = [0, 0, 0, 0, 0];
let antallPar = 0;
function ettPar(ettEllerTo) {
    if (dices[0] == dices[1] || dices[0] == dices[2] || dices[0] == dices[3] || dices[0] == dices[4]) {
        ettpar[0] = dices[0] * 2
        antallPar++
        console.log(antallPar)
    }
    if (dices[1] == dices[2] || dices[1] == dices[3] || dices[1] == dices[4]) {
        ettpar[1] = dices[1] * 2
        antallPar++
        console.log(antallPar)
    }
    if (dices[2] == dices[3] || dices[2] == dices[4]) {
        ettpar[2] = dices[2] * 2
        antallPar++
        console.log(antallPar)
    }
    if (dices[3] == dices[4]) {
        ettpar[3] = dices[3] * 2
        antallPar++
        console.log(antallPar)
    }
    ettpar.sort(function (a, b) { return a - b });
    console.log(ettpar[ettpar.length - 1]);

    if (antallPar >= 2 && ettEllerTo == "to") {
        toPar()
    }
    else {
        place("ettPar", ettpar[ettpar.length - 1])
    }

    ettpar = [0, 0, 0, 0, 0]
    antallPar = 0;
}
let toParSum;
function toPar() {
    if (ettpar[ettpar.length - 1] != ettpar[ettpar.length - 2]) {
        console.log("yay")
        toParSum = ettpar[ettpar.length - 1] + ettpar[ettpar.length - 2]
        place("toPar", toParSum)
    }
    toParSum = 0;
}

let trelike = 0;
let hustall = 0;
function treLikeOgHus(heyo) {
    if (dices[0] == dices[1] && dices[0] == dices[2] ||
        dices[0] == dices[1] && dices[0] == dices[3] ||
        dices[0] == dices[1] && dices[0] == dices[4] ||
        dices[0] == dices[2] && dices[0] == dices[3] ||
        dices[0] == dices[2] && dices[0] == dices[4] ||
        dices[0] == dices[3] && dices[0] == dices[4]) {

        trelike = dices[0] * 3
        if (heyo == "hus") {
            hus(0)
            hustall++
        }
    }
    if (dices[1] == dices[2] && dices[1] == dices[3] ||
        dices[1] == dices[2] && dices[1] == dices[4] ||
        dices[1] == dices[3] && dices[1] == dices[4]) {

        trelike = dices[1] * 3
        if (heyo == "hus") {
            hus(1)
            hustall++
        }
    }
    if (dices[2] == dices[3] && dices[2] == dices[4]) {

        trelike = dices[2] * 3

        if (heyo == "hus") {
            hus(2)
            hustall++
        }
    }
    if (heyo == "hus" && hustall == 0) {
        hus(0)
    }
    if (heyo == "tre") {
        place("treLike", trelike)
    }
    trelike = 0
    hustall = 0
}

let firelike = 0;
function fireLike() {
    if (dices[0] == dices[1] && dices[0] == dices[2] && dices[0] == dices[3] ||
        dices[0] == dices[1] && dices[0] == dices[2] && dices[0] == dices[4] ||
        dices[0] == dices[1] && dices[0] == dices[3] && dices[0] == dices[4] ||
        dices[0] == dices[2] && dices[0] == dices[3] && dices[0] == dices[4]) {

        firelike = dices[0] * 4
    }
    if (dices[1] == dices[2] && dices[1] == dices[3] && dices[1] == dices[4]) {

        firelike = dices[1] * 4
    }
    place("fireLike", firelike)
    firelike = 0;
}

function litenStraight() {
    if ((dices[0] == 1 || dices[1] == 1 || dices[2] == 1 || dices[3] == 1 || dices[4] == 1) &&
        (dices[0] == 2 || dices[1] == 2 || dices[2] == 2 || dices[3] == 2 || dices[4] == 2) &&
        (dices[0] == 3 || dices[1] == 3 || dices[2] == 3 || dices[3] == 3 || dices[4] == 3) &&
        (dices[0] == 4 || dices[1] == 4 || dices[2] == 4 || dices[3] == 4 || dices[4] == 4) &&
        (dices[0] == 5 || dices[1] == 5 || dices[2] == 5 || dices[3] == 5 || dices[4] == 5)) {

        place("litenStraight", 15)
    }
    else {
        place("litenStraight", 0)
    }
}

function storStraight() {
    if ((dices[0] == 2 || dices[1] == 2 || dices[2] == 2 || dices[3] == 2 || dices[4] == 2) &&
        (dices[0] == 3 || dices[1] == 3 || dices[2] == 3 || dices[3] == 3 || dices[4] == 3) &&
        (dices[0] == 4 || dices[1] == 4 || dices[2] == 4 || dices[3] == 4 || dices[4] == 4) &&
        (dices[0] == 5 || dices[1] == 5 || dices[2] == 5 || dices[3] == 5 || dices[4] == 5) &&
        (dices[0] == 6 || dices[1] == 6 || dices[2] == 6 || dices[3] == 6 || dices[4] == 6)) {

        place("storStraight", 20)
    }
    else {
        place("storStraight", 0)
    }
}

let y = 0;
let rest = [11, 11];
let husSum = 0;
function hus(dice) {
    for (i = 0; i < 5; i++) {
        if (dices[i] != dices[dice]) {
            rest[y] = i
            y++
        }
    }
    if (rest[1] != 11 && rest[0] != 11) {
        if (dices[rest[0]] == dices[rest[1]]) {
            for (i = 0; i < 5; i++) {
                husSum += dices[i]
            }
        }
    }
    place("hus", husSum)
    husSum = 0;
    y = 0;
}

let sjanseSum = 0;
function sjanse() {
    for (i = 0; i < 5; i++) {
        sjanseSum += dices[i]
    }
    place("sjanse", sjanseSum)
    sjanseSum = 0
}

let yatzySum = 0;
function yatzy() {
    if (dices[0] == dices[1] && dices[0] == dices[2] && dices[0] == dices[3] && dices[0] == dices[4]) {

        yatzySum = 50
    }
    place("yatzy", yatzySum)
    yatzySum = 0;
}

function totalSum() {
    for (i = 0; i < players; i++) {
        //console.log("totalSum" + " " + actPlayers[i])
        document.getElementsByClassName("totalSum" + " " + actPlayers[i])[0].innerHTML = finalSum[i]
    }
    /*
    let max = Math.max(...finalSum)
    let index = finalSum.indexOf(max)
    alert(index + " " + max)
    localStorage.win = finalSum[index]
    localStorage.name = prompt("Name???")
    localStorage.date = new Date()
    console.log(localStorage.date)
    document.getElementsByClassName("name num1")[0].innerHTML = localStorage.name
    document.getElementsByClassName("date num1")[0].innerHTML = localStorage.date
    document.getElementById("first").innerHTML = localStorage.win
    */
}

function restart() {
    totalSum()
    document.getElementById("start").disabled = false;

    players = 5;
    allPlayers = ["P1", "P2", "P3", "P4", "P5"];
    actPlayers = [];
    whosTurn = document.getElementById("whosTurn")
    turn = 0;
    finalSum = []
    sum;
    dices = []
    placed = 0;
    rollbtn.disabled = true;
    for (i = 1; i < 6; i++) {
        document.getElementById("P" + i).checked = true
        var elements = document.getElementsByClassName("P" + i);
        for (var x = 0; x < elements.length; x++) {
            elements[x].innerHTML = "";
        }
    }
}