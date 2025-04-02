let visualEngine, gameFieldScene, gameCamera;
let matchConclusionDisplay, pointsTableDisplay;
let competitionMatches = [];
let competitionConfiguration;
let activeMatchNumber = 0;
let competitionVictorList = [];
let eliminatedSemiFinalists = [];

let discMotionX, discMotionY;

function initiateGameplay(globalSetup) {
  let competitorOneName = globalSetup.player1Name || 'Player 1';
  let competitorTwoName = globalSetup.player2Name || 'Player 2';
  let playMode = globalSetup.playMode || 'standard';
  let racketScaleChoice = globalSetup.racketScaleChoice || 'medium';
  let discVelocityOption = globalSetup.discVelocityOption || 'medium';
  let computerControlled = globalSetup.computerControlled || false;
  let computerSkillLevel = globalSetup.computerSkillLevel || 'medium';
  let finalizeMatchCallback = globalSetup.onGameOver || null;
  let matchTheme = globalSetup.matchTheme || 'default';

  let computerDeviation = 0.75; 
  if (computerControlled) {
    if (computerSkillLevel === 'easy') {
      computerDeviation = 1.5; 
    } else if (computerSkillLevel === 'medium') {
      computerDeviation = 0.75; 
    } else {
      computerDeviation = 0.1; 
    }
  }

  gameFieldScene = new THREE.Scene();
  gameCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  visualEngine = new THREE.WebGLRenderer();
  visualEngine.setSize(window.innerWidth, window.innerHeight);
  visualEngine.shadowMap.enabled = true;
  document.body.appendChild(visualEngine.domElement);

  let competitorOnePoints = 0;
  let competitorTwoPoints = 0;
  const targetVictoryCount = 5; 

  pointsTableDisplay = document.createElement('div');
  pointsTableDisplay.style.position = 'absolute';
  pointsTableDisplay.style.top = '10px';
  pointsTableDisplay.style.left = '50%';
  pointsTableDisplay.style.transform = 'translateX(-50%)';
  pointsTableDisplay.style.color = 'white';
  pointsTableDisplay.style.fontSize = '24px';
  document.body.appendChild(pointsTableDisplay);

  function revisePointsTable() {
    pointsTableDisplay.innerHTML = `${competitorOneName}: ${competitorOnePoints} - ${competitorTwoName}: ${competitorTwoPoints}`;
  }
  revisePointsTable();

  matchConclusionDisplay = document.createElement('div');
  matchConclusionDisplay.style.position = 'absolute';
  matchConclusionDisplay.style.top = '50%';
  matchConclusionDisplay.style.left = '50%';
  matchConclusionDisplay.style.transform = 'translate(-50%, -50%)';
  matchConclusionDisplay.style.color = 'white';
  matchConclusionDisplay.style.fontSize = '32px';
  matchConclusionDisplay.style.textAlign = 'center';
  matchConclusionDisplay.style.display = 'none';
  document.body.appendChild(matchConclusionDisplay);

  const arenaHorizontalSize = 10; 
  const arenaVerticalSize = 5; 
  const barrierDensity = 0.2;

  let groundColor = 0x00ff00; 
  let boundaryColor = 0x888888; 
  let racketColor = 0xffffff; 
  let discColor = 0x333333; 
  let discShapeType = 'cylinder'; 

  if (matchTheme === 'hockey') {
    groundColor = 0xadd8e6; 
    boundaryColor = 0x888888; 
    racketColor = 0x0000ff; 
    discColor = 0x333333; 
    discShapeType = 'cylinder'; 
  }

  if (matchTheme === 'football') {
    groundColor = 0x00ff00;
    boundaryColor = 0xffffff;
    racketColor = 0xffffff;
    discColor = 0xffffff; 
    discShapeType = 'sphere';
  }

  const groundMaterial = new THREE.MeshLambertMaterial({
    color: groundColor,
    side: THREE.DoubleSide,
  });
  const boundaryMaterial = new THREE.MeshLambertMaterial({ color: boundaryColor });
  const racketMaterial = new THREE.MeshLambertMaterial({ color: racketColor });
  const discMaterial = new THREE.MeshLambertMaterial({ color: discColor });

  const groundGeometry = new THREE.PlaneGeometry(20, 10);
  const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
  groundPlane.receiveShadow = true;
  gameFieldScene.add(groundPlane);

  const topBoundary = new THREE.Mesh(
    new THREE.BoxGeometry(20, barrierDensity, 1),
    boundaryMaterial
  );
  topBoundary.position.y = arenaVerticalSize;
  topBoundary.receiveShadow = true;
  gameFieldScene.add(topBoundary);

  const bottomBoundary = new THREE.Mesh(
    new THREE.BoxGeometry(20, barrierDensity, 1),
    boundaryMaterial
  );
  bottomBoundary.position.y = -arenaVerticalSize;
  bottomBoundary.receiveShadow = true;
  gameFieldScene.add(bottomBoundary);

  let racketHeight;
  if (racketScaleChoice === 'large') {
    racketHeight = 3;
  } else if (racketScaleChoice === 'medium') {
    racketHeight = 2;
  } else {
    racketHeight = 1;
  }
  const racketWidth = 0.2,
    racketDepth = 1;

  const leftRacketGeometry = new THREE.BoxGeometry(
    racketWidth,
    racketHeight,
    racketDepth
  );
  const leftRacket = new THREE.Mesh(leftRacketGeometry, racketMaterial);
  leftRacket.position.x = -arenaHorizontalSize + racketWidth / 2;
  leftRacket.castShadow = true;
  gameFieldScene.add(leftRacket);

  const rightRacketGeometry = new THREE.BoxGeometry(
    racketWidth,
    racketHeight,
    racketDepth
  );
  const rightRacket = new THREE.Mesh(rightRacketGeometry, racketMaterial);
  rightRacket.position.x = arenaHorizontalSize - racketWidth / 2;
  rightRacket.castShadow = true;
  gameFieldScene.add(rightRacket);

  let disc;
  if (discShapeType === 'cylinder') {
    const discGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.rotation.x = Math.PI / 2;
  } else {
    const discGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.position.z = 0.3; 
  }
  disc.position.y = 0.1; 
  disc.castShadow = true;
  gameFieldScene.add(disc);

  const softLight = new THREE.AmbientLight(0xffffff, 0.3);
  gameFieldScene.add(softLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(20, 20, 10);
  mainLight.castShadow = true;
  gameFieldScene.add(mainLight);
  mainLight.shadow.bias = -0.00005; 
  mainLight.shadow.normalBias = 0.0; 

  mainLight.shadow.mapSize.width = 4096;
  mainLight.shadow.mapSize.height = 4096;
  const d = 15;
  mainLight.shadow.camera.left = -d;
  mainLight.shadow.camera.right = d;
  mainLight.shadow.camera.top = d;
  mainLight.shadow.camera.bottom = -d;

  gameCamera.position.z = 10;
  gameCamera.position.y = -5;
  gameCamera.lookAt(0, 0, 0);

  if (discVelocityOption === 'fast') {
    discMotionX = 0.2; 
    discMotionY = 0.15;  
  } else if (discVelocityOption === 'medium') {
    discMotionX = 0.15;  
    discMotionY = 0.10; 
  } else {
    discMotionX = 0.09; 
    discMotionY = 0.05; 
  }

  const racketDisplacementSpeed = 0.1;

  let leftMoveUp = false;
  let leftMoveDown = false;
  let rightMoveUp = false;
  let rightMoveDown = false;

  let computerTargetY = rightRacket.position.y; 
  let matchEnded = false;

  document.addEventListener('keydown', userKeyDown);
  document.addEventListener('keyup', userKeyUp);

  function userKeyDown(event) {
    if (event.key === 'a' || event.key === 'A') leftMoveUp = true;
    if (event.key === 's' || event.key === 'S') leftMoveDown = true;
    if (!computerControlled) {
      if (event.key === 'k' || event.key === 'K') rightMoveUp = true;
      if (event.key === 'l' || event.key === 'L') rightMoveDown = true;
    }
  }

  function userKeyUp(event) {
    if (event.key === 'a' || event.key === 'A') leftMoveUp = false;
    if (event.key === 's' || event.key === 'S') leftMoveDown = false;
    if (!computerControlled) {
      if (event.key === 'k' || event.key === 'K') rightMoveUp = false;
      if (event.key === 'l' || event.key === 'L') rightMoveDown = false;
    }
  }

  if (computerControlled) {
    setInterval(refreshAIControl, 1000);
  }

  function verifyCollision(discX, discY, racketX, racketY, racketW, racketH) {
    const discMinX = discX - 0.3;
    const discMaxX = discX + 0.3;
    const discMinY = discY - 0.3;
    const discMaxY = discY + 0.3;

    const padMinX = racketX - racketW / 2;
    const padMaxX = racketX + racketW / 2;
    const padMinY = racketY - racketH / 2;
    const padMaxY = racketY + racketH / 2;

    return (discMinX <= padMaxX && discMaxX >= padMinX && discMinY <= padMaxY && discMaxY >= padMinY);
  }

  function renderMotion() {
    if (!matchEnded) {
      requestAnimationFrame(renderMotion);
    }

    disc.position.x += discMotionX;
    disc.position.y += discMotionY;

    if (playMode === 'imponderable') {
      discMotionX += (Math.random() - 0.5) * 0.01;
      discMotionY += (Math.random() - 0.5) * 0.01;
    }

    if (playMode === 'accelerating') {
      discMotionX *= 1.001;
      discMotionY *= 1.001;
    }

    const verticalCollisionBorder = arenaVerticalSize - 0.5 - barrierDensity / 2;
    if (disc.position.y > verticalCollisionBorder || disc.position.y < -verticalCollisionBorder) {
      discMotionY = -discMotionY;
    }

    let collisionLeft = verifyCollision(
      disc.position.x, disc.position.y,
      leftRacket.position.x, leftRacket.position.y,
      racketWidth, racketHeight
    );

    let collisionRight = verifyCollision(
      disc.position.x, disc.position.y,
      rightRacket.position.x, rightRacket.position.y,
      racketWidth, racketHeight
    );

    if (collisionRight) {
      discMotionX = -discMotionX;
      disc.position.x = rightRacket.position.x - (racketWidth / 2 + 0.5);
    }

    if (collisionLeft) {
      discMotionX = -discMotionX;
      disc.position.x = leftRacket.position.x + (racketWidth / 2 + 0.5);
    }

    if (!collisionRight && disc.position.x > rightRacket.position.x) {
      competitorOnePoints++;
      revisePointsTable();
      recenterDisc();
      if (competitorOnePoints >= targetVictoryCount) {
        wrapUpMatch(competitorOneName);
      }
    }

    if (!collisionLeft && disc.position.x < leftRacket.position.x) {
      competitorTwoPoints++;
      revisePointsTable();
      recenterDisc();
      if (competitorTwoPoints >= targetVictoryCount) {
        wrapUpMatch(competitorTwoName);
      }
    }

    if (leftMoveUp && leftRacket.position.y < arenaVerticalSize - racketHeight / 2) {
      leftRacket.position.y += racketDisplacementSpeed;
    }
    if (leftMoveDown && leftRacket.position.y > -arenaVerticalSize + racketHeight / 2) {
      leftRacket.position.y -= racketDisplacementSpeed;
    }

    if (computerControlled) {
      let rightRacketPos = rightRacket.position.y;
      let diffY = computerTargetY - rightRacketPos;
      const threshold = 0.1;
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0 && rightRacketPos < arenaVerticalSize - racketHeight / 2) {
          rightRacket.position.y += racketDisplacementSpeed;
        } else if (diffY < 0 && rightRacketPos > -arenaVerticalSize + racketHeight / 2) {
          rightRacket.position.y -= racketDisplacementSpeed;
        }
      }
    } else {
      if (rightMoveUp && rightRacket.position.y < arenaVerticalSize - racketHeight / 2) {
        rightRacket.position.y += racketDisplacementSpeed;
      }
      if (rightMoveDown && rightRacket.position.y > -arenaVerticalSize + racketHeight / 2) {
        rightRacket.position.y -= racketDisplacementSpeed;
      }
    }

    visualEngine.render(gameFieldScene, gameCamera);
  }



  function recenterDisc() {
    if (discShapeType === 'cylinder')
      disc.position.set(0, 0, 0);
    else
      disc.position.set(0, 0, 0.3);
  
    if (discVelocityOption === 'fast') {
      discMotionX = (Math.random() > 0.5 ? 1 : -1) * 0.2;
      discMotionY = Math.random() * 0.15 - 0.075; 
    } else if (discVelocityOption === 'medium') {
      discMotionX = (Math.random() > 0.5 ? 1 : -1) * 0.15;
      discMotionY = Math.random() * 0.10 - 0.05; 
    } else {
      discMotionX = (Math.random() > 0.5 ? 1 : -1) * 0.09;
      discMotionY = Math.random() * 0.05 - 0.025; 
    }
  }
  

  function foreseeDiscPosition() {
    let ballPosX = disc.position.x;
    let ballPosY = disc.position.y;
    let hypotheticalMotionX = discMotionX;
    let hypotheticalMotionY = discMotionY;

    let aiRacketX = rightRacket.position.x;

    if (hypotheticalMotionX === 0) {
      hypotheticalMotionX = 0.0001;
    }

    let timeUntilRacket = (aiRacketX - ballPosX) / hypotheticalMotionX;

    if (timeUntilRacket < 0) {
      return rightRacket.position.y;
    }

    let predictedY = ballPosY;
    let predictedSpeedY = hypotheticalMotionY;
    let remainingT = timeUntilRacket;

    while (remainingT > 0) {
      let timeToWall;
      if (predictedSpeedY > 0) {
        timeToWall =
          (arenaVerticalSize - predictedY - 0.5 - barrierDensity / 2) / predictedSpeedY;
      } else {
        timeToWall =
          (-arenaVerticalSize - predictedY + 0.5 + barrierDensity / 2) / predictedSpeedY;
      }

      if (timeToWall > remainingT) {
        predictedY += predictedSpeedY * remainingT;
        remainingT = 0;
      } else {
        predictedY += predictedSpeedY * timeToWall;
        predictedSpeedY = -predictedSpeedY;
        remainingT -= timeToWall;
      }
    }

    predictedY += (Math.random() - 0.5) * computerDeviation;

    const maxY = arenaVerticalSize - racketHeight / 2;
    const minY = -arenaVerticalSize + racketHeight / 2;
    predictedY = Math.max(minY, Math.min(maxY, predictedY));

    return predictedY;
  }

  function refreshAIControl() {
    computerTargetY = foreseeDiscPosition();
  }

  function wrapUpMatch(victorName) {
    matchEnded = true;

    document.removeEventListener('keydown', userKeyDown);
    document.removeEventListener('keyup', userKeyUp);

    while (gameFieldScene.children.length > 0) {
      gameFieldScene.remove(gameFieldScene.children[0]);
    }
    visualEngine.render(gameFieldScene, gameCamera); 

    matchConclusionDisplay.innerHTML = `
      <div class="card bg-light p-3">
      <h1Match End</h1>
      <p>${victorName} won!</p>
      <p>Final Score: ${competitorOneName} ${competitorOnePoints} - ${competitorTwoName} ${competitorTwoPoints}</p>
      </div>
    `;

    fetch('/game/api/save-match/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({
        player1: competitorOneName,
        player2: competitorTwoName,
        player1_score: competitorOnePoints,
        player2_score: competitorTwoPoints,
      }),
    });

    if (finalizeMatchCallback && typeof finalizeMatchCallback === 'function') {
      matchConclusionDisplay.innerHTML += `<button class="btn btn-info" id="nextMatchButton">Continue</button>`;
      matchConclusionDisplay.style.display = 'block';

      document.getElementById('nextMatchButton').addEventListener('click', () => {
        matchConclusionDisplay.style.display = 'none';
        document.body.removeChild(visualEngine.domElement);
        document.body.removeChild(pointsTableDisplay);
        document.body.removeChild(matchConclusionDisplay);

        finalizeMatchCallback(victorName);
      });
    } else {
      matchConclusionDisplay.innerHTML += `<button id="restartButton" class="btn btn-warning btn-lg">Restart</button>`;
      matchConclusionDisplay.style.display = 'block';
      document.getElementById('restartButton').addEventListener('click', () => {
        competitorOnePoints = 0;
        competitorTwoPoints = 0;
        revisePointsTable();

        matchEnded = false;

        matchConclusionDisplay.style.display = 'none';
        document.body.removeChild(visualEngine.domElement);
        document.body.removeChild(pointsTableDisplay);
        document.body.removeChild(matchConclusionDisplay);

        document.getElementById('mainMenu').style.display = 'block';
      });
    }
  }

  renderMotion();
}

function initiateCompetition() {
  competitionConfiguration = window.overallTournamentSetup;

  const shuffledPlayers = competitionConfiguration.players.slice();
  shuffleContestants(shuffledPlayers);

  competitionMatches = [
    { player1: shuffledPlayers[0], player2: shuffledPlayers[1], winner: null, isSemiFinal: true },
    { player1: shuffledPlayers[2], player2: shuffledPlayers[3], winner: null, isSemiFinal: true },
    { player1: null, player2: null, winner: null, isThirdPlace: true },
    { player1: null, player2: null, winner: null, isFinal: true },
  ];

  activeMatchNumber = 0;
  competitionVictorList = [];
  eliminatedSemiFinalists = [];

  displayUpcomingMatchPrompt();
}

function displayUpcomingMatchPrompt() {
  const currentMatch = competitionMatches[activeMatchNumber];

  if (currentMatch.isThirdPlace && currentMatch.player1 === null && currentMatch.player2 === null) {
    currentMatch.player1 = eliminatedSemiFinalists[0];
    currentMatch.player2 = eliminatedSemiFinalists[1];
  }

  if (currentMatch.isFinal && currentMatch.player1 === null && currentMatch.player2 === null) {
    currentMatch.player1 = competitionMatches[0].winner;
    currentMatch.player2 = competitionMatches[1].winner;
  }

  let matchTitle = "Next Match:";
  if (currentMatch.isSemiFinal) {
    matchTitle = "Semi-Final Match:";
  } else if (currentMatch.isThirdPlace) {
    matchTitle = "Third Place Match:";
  } else if (currentMatch.isFinal) {
    matchTitle = "Final Match:";
  }

  const readinessScreen = document.createElement('div');
  readinessScreen.style.position = 'absolute';
  readinessScreen.style.top = '50%';
  readinessScreen.style.left = '50%';
  readinessScreen.style.transform = 'translate(-50%, -50%)';
  readinessScreen.style.color = 'white';
  readinessScreen.style.fontSize = '24px';
  readinessScreen.style.textAlign = 'center';
  readinessScreen.innerHTML = `
    <div class="card bg-light p-3">
    <p class="text-dark">${matchTitle}</p>
    <p class="text-dark">${currentMatch.player1} vs ${currentMatch.player2}</p>
    <button class="btn btn-success" id="startMatchButton">Ready</button>
    </div>
  `;
  document.body.appendChild(readinessScreen);

  document.getElementById('startMatchButton').addEventListener('click', () => {
    document.body.removeChild(readinessScreen);
    commenceMatch(currentMatch.player1, currentMatch.player2, competitionConfiguration, concludeMatchEvent);
  });
}

function concludeMatchEvent(victoriousName) {
  const endedMatch = competitionMatches[activeMatchNumber];
  endedMatch.winner = victoriousName;

  if (endedMatch.isSemiFinal) {
    const loserName = endedMatch.player1 === victoriousName ? endedMatch.player2 : endedMatch.player1;
    eliminatedSemiFinalists.push(loserName);
  }

  activeMatchNumber++;

  if (activeMatchNumber < competitionMatches.length) {
    displayUpcomingMatchPrompt();
  } else {
    showCompetitionOutcome();
  }
}

function commenceMatch(p1Name, p2Name, configuration, endCallback) {
  const matchSettings = {
    player1Name: p1Name,
    player2Name: p2Name,
    computerControlled: false,
    playMode: configuration.gameMode,
    racketScaleChoice: configuration.paddleSize,
    discVelocityOption: configuration.ballSpeed,
    onGameOver: endCallback,
    matchTheme: configuration.gameTheme 
  };

  initiateGameplay(matchSettings);
}

function shuffleContestants(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const indexRandom = Math.floor(Math.random() * (i + 1));
    [array[i], array[indexRandom]] = [array[indexRandom], array[i]];
  }
}

function showCompetitionOutcome() {
  const finalRound = competitionMatches.find(m => m.isFinal);
  const championName = finalRound.winner;
  const runnerUpName = finalRound.player1 === championName ? finalRound.player2 : finalRound.player1;

  const thirdPlaceRound = competitionMatches.find(m => m.isThirdPlace);
  const thirdPosition = thirdPlaceRound.winner;
  const fourthPosition = thirdPlaceRound.player1 === thirdPosition ? thirdPlaceRound.player2 : thirdPlaceRound.player1;

  const finalMessage = `
    <div class="card bg-light p-3">
    <h1>Tournament Results</h1>
    <ol>
      <li>${championName} (Champion)</li>
      <li>${runnerUpName} (Runner-Up)</li>
      <li>${thirdPosition} (Third Place)</li>
      <li>${fourthPosition} (Fourth Place)</li>
    </ol>
    <button id="restartTournamentButton" class="btn btn-warning btn-lg">Restart</button>
    </div>
  `;

  const resultScreen = document.createElement('div');
  resultScreen.style.position = 'absolute';
  resultScreen.style.top = '50%';
  resultScreen.style.left = '50%';
  resultScreen.style.transform = 'translate(-50%, -50%)';
  resultScreen.style.color = 'white';
  resultScreen.style.fontSize = '24px';
  resultScreen.style.textAlign = 'center';
  resultScreen.innerHTML = finalMessage;
  document.body.appendChild(resultScreen);

  document.getElementById('restartTournamentButton').addEventListener('click', () => {
    document.body.removeChild(resultScreen);
    document.getElementById('mainMenu').style.display = 'block';
  });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}