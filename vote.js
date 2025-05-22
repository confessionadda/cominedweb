const gameName = 'crushgirls'; 

// Load nominees on page load
window.onload = () => {
  fetchIPAndLoadNominees();
};

let userIP = null;

function fetchIPAndLoadNominees() {
  fetch("https://api.ipify.org?format=json")
    .then(response => response.json())
    .then(data => {
      userIP = data.ip;
      checkIfAlreadyVoted(userIP).then((hasVoted) => {
        loadNominees(hasVoted);
      });
    })
    .catch(error => {
      console.error("Failed to fetch IP:", error);
      alert("Unable to verify your voting status. Please try again later.");
    });
}

function checkIfAlreadyVoted(ip) {
  return db.collection("ipVotes").doc(ip).get().then(doc => doc.exists);
}

function loadNominees(hasVoted) {
  const nomineeList = document.getElementById('nomineeList');
  nomineeList.innerHTML = '<li>Loading nominees...</li>';

  db.collection('nominations').get()
    .then((querySnapshot) => {
      nomineeList.innerHTML = '';

      if (querySnapshot.empty) {
        nomineeList.innerHTML = '<li>No nominees found.</li>';
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');
        li.textContent = `${data.username} (${data.year} - ${data.branch})`;

        const voteBtn = document.createElement('button');
        voteBtn.textContent = hasVoted ? 'Already Voted' : 'Vote';
        voteBtn.classList.add('vote-btn');
        voteBtn.disabled = hasVoted;

        if (hasVoted) {
          voteBtn.style.backgroundColor = '#555';
          voteBtn.style.cursor = 'not-allowed';
        } else {
          voteBtn.onclick = function () {
            voteBtn.disabled = true; 
            voteBtn.textContent = 'Submitting...';
            voteForNominee(doc.id, voteBtn);
          };
        }

        li.appendChild(voteBtn);
        nomineeList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error loading nominees:", error);
      nomineeList.innerHTML = '<li>Error loading nominees. See console.</li>';
    });
}

function voteForNominee(nomineeId, voteBtn) {
  const nomineeRef = db.collection('nominations').doc(nomineeId);

  db.runTransaction((transaction) => {
    return transaction.get(nomineeRef).then((doc) => {
      if (!doc.exists) {
        throw "Nominee does not exist!";
      }
      let newVotes = (doc.data().votes || 0) + 1;
      transaction.update(nomineeRef, { votes: newVotes });
      return newVotes;
    });
  })
  .then((newVotes) => {
    // Save the user's IP as voted
    db.collection('ipVotes').doc(userIP).set({
      votedAt: new Date().toISOString()
    }).then(() => {
      alert(`Thank you for voting! This nominee now has ${newVotes} votes.`);
      disableVoteButtons();
    });
  })
  .catch((error) => {
    console.error("Voting failed: ", error);
    alert("Error while voting. Please try again.");

    if (voteBtn) {
      voteBtn.disabled = false;
      voteBtn.textContent = 'Vote';
    }
  });
}

function disableVoteButtons() {
  const buttons = document.querySelectorAll('button.vote-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.textContent = 'Already Voted';
    btn.style.backgroundColor = '#555';
    btn.style.cursor = 'not-allowed';
  });
}

