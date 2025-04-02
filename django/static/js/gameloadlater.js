document.getElementById("vsModeButton").addEventListener("click", function () {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("gameOptionsForm").style.display = "block";
});

document.getElementById("tournamentModeButton").addEventListener("click", function () {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("tournamentForm").style.display = "block";
});

document.getElementById("aiMode").addEventListener("change", function () {
    const chosenAIMode = this.value;
    const difficultyBlock = document.getElementById("difficultyOptions");
    const player2NameBlock = document.getElementById("player2Div");
    if (chosenAIMode === "yes") {
        difficultyBlock.style.display = "block";
        player2NameBlock.style.display = "none";
    } else {
        difficultyBlock.style.display = "none";
        player2NameBlock.style.display = "block";
    }
});

document.getElementById("gameOptionsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const competitorOneNameFixed = document.getElementById("player1Name").value;
    const competitorTwoNameGiven = document.getElementById("player2Name").value;
    const chosenAIMode = document.getElementById("aiMode").value;
    const chosenAISkill = document.getElementById("aiDifficulty").value;
    const selectedPlayMode = document.getElementById("gameMode").value;
    const chosenRacketSize = document.getElementById("paddleSize").value;
    const chosenDiscSpeed = document.getElementById("ballSpeed").value;
    const chosenTheme = document.getElementById("gameTheme").value;

    window.overallGameSettings = {
        mode: "vs",
        player1Name: competitorOneNameFixed,
        player2Name: chosenAIMode === "yes" ? "AI" : competitorTwoNameGiven,
        computerControlled: chosenAIMode === "yes",
        computerSkillLevel: chosenAISkill,
        playMode: selectedPlayMode,
        racketScaleChoice: chosenRacketSize,
        discVelocityOption: chosenDiscSpeed,
        matchTheme: chosenTheme,
    };

    if (competitorTwoNameGiven === "no_friend" && chosenAIMode === "no") {
        alert("Dont Have Friends");
        return;
    }

    document.getElementById("gameOptionsForm").style.display = "none";

    if (typeof initiateGameplay === "function") {
        initiateGameplay(window.overallGameSettings);
    } else {
        console.error("initiateGameplay fonksiyonu tanımlı değil.");
    }
});

document.getElementById("tournamentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const competitorOneNameTournament = document.getElementById("player1Name").value;
    const competitorTwoNameTournament = document.getElementById("player2NameTournament").value;
    const competitorThreeNameTournament = document.getElementById("player3Name").value;
    const competitorFourNameTournament = document.getElementById("player4Name").value;
    const selectedTournamentMode = document.getElementById("gameModeTournament").value;
    const chosenTournamentRacket = document.getElementById("paddleSizeTournament").value;
    const chosenTournamentDiscSpeed = document.getElementById("ballSpeedTournament").value;
    const chosenTournamentTheme = document.getElementById("gameThemeTournament").value;

    if (competitorOneNameTournament === "no_friend" || competitorTwoNameTournament === "no_friend" || competitorThreeNameTournament === "no_friend" || competitorFourNameTournament === "no_friend") {
        alert("Dont Have Friends");
        return;
    }

    if (competitorOneNameTournament === competitorTwoNameTournament || competitorOneNameTournament === competitorThreeNameTournament || competitorOneNameTournament === competitorFourNameTournament || competitorTwoNameTournament === competitorThreeNameTournament || competitorTwoNameTournament === competitorFourNameTournament || competitorThreeNameTournament === competitorFourNameTournament) {
        alert("Please enter different names.");
        return;
    }

    window.overallTournamentSetup = {
        mode: "tournament",
        players: [competitorOneNameTournament, competitorTwoNameTournament, competitorThreeNameTournament, competitorFourNameTournament],
        gameMode: selectedTournamentMode,
        paddleSize: chosenTournamentRacket,
        ballSpeed: chosenTournamentDiscSpeed,
        gameTheme: chosenTournamentTheme,
    };

    document.getElementById("tournamentForm").style.display = "none";

    if (typeof initiateCompetition === "function") {
        initiateCompetition();
    } else {
        console.error("initiateCompetition fonksiyonu tanımlı değil.");
    }
});