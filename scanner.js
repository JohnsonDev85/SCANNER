const kitufeAnza = document.getElementById("anza");
const kisanduku = document.getElementById("jibu");
const jinaMgeni = document.getElementById("jinaMgeni");
const hali = document.getElementById("hali");

let anaangalia = false;
let scanner = null;
let db = null;

function onyeshaJibu(darasa, jina, maneno) {
  kisanduku.style.background = ""; // futa rangi maalum ya mwisho
  kisanduku.className = darasa;
  kisanduku.style.display = "block";
  jinaMgeni.textContent = jina;
  hali.textContent = maneno;
}

window.onerror = function (ujumbe) {
  onyeshaJibu("haijulikani", "Kosa la JS", ujumbe);
};

try {
  const firebaseConfig = {
    apiKey: "AIzaSyBhh3nIzAWyvT47HQ-hh6umjqoCMYBI1Lk",
    authDomain: "johcards-2db9b.firebaseapp.com",
    projectId: "johcards-2db9b",
    storageBucket: "johcards-2db9b.firebasestorage.app",
    messagingSenderId: "955656442066",
    appId: "1:955656442066:web:3f0d0335191d67eac61d0b"
  };
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
} catch (error) {
  onyeshaJibu("haijulikani", "Firebase haijapakia", error.message);
}

async function angaliaMgeni(maandishi) {
  const sehemu = maandishi.split("::");

  if (sehemu.length !== 2) {
    onyeshaJibu("haijulikani", "", "KADI HAIJULIKANI");
    return;
  }

  const ref = db
    .collection("events").doc(sehemu[0])
    .collection("guests").doc(sehemu[1]);

  try {
    // Transaction: inazuia watu wawili kuingia kwa kadi moja kwa wakati mmoja
    const matokeo = await db.runTransaction(async function (t) {
      const doc = await t.get(ref);

      if (!doc.exists) {
        return { aina: "haijulikani" };
      }

      const mgeni = doc.data();

      if (mgeni.paid !== true) {
        return { aina: "haijalipwa", jina: mgeni.name };
      }

      if (mgeni.attended === true) {
        return { aina: "ameshaingia", jina: mgeni.name };
      }

      t.update(ref, {
        attended: true,
        attendedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { aina: "karibu", jina: mgeni.name };
    });

    if (matokeo.aina === "haijulikani") {
      onyeshaJibu("haijulikani", "", "KADI HAIJULIKANI");
    } else if (matokeo.aina === "haijalipwa") {
      onyeshaJibu("haijalipwa", matokeo.jina, "HAJALIPA ✘");
    } else if (matokeo.aina === "ameshaingia") {
      onyeshaJibu("haijulikani", matokeo.jina, "ALISHAINGIA TAYARI");
      kisanduku.style.background = "#e8710a"; // machungwa
    } else {
      onyeshaJibu("imelipwa", matokeo.jina, "AMELIPA ✔ KARIBU");
    }
  } catch (error) {
    onyeshaJibu("haijulikani", "Kosa", error.message);
  }
}

function scanImefanikiwa(maandishi) {
  if (anaangalia) return;
  anaangalia = true;
  angaliaMgeni(maandishi);
}

kitufeAnza.addEventListener("click", function () {
  if (typeof Html5Qrcode === "undefined") {
    onyeshaJibu("haijulikani", "Kosa", "Maktaba ya scanner haijapakia");
    return;
  }

  if (!scanner) {
    scanner = new Html5Qrcode("reader");
  }

  onyeshaJibu("haijulikani", "Subiri...", "Inafungua kamera");

  scanner
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 220 },
      scanImefanikiwa
    )
    .then(function () {
      kisanduku.style.display = "none";
    })
    .catch(function (error) {
      onyeshaJibu("haijulikani", "Kamera haijafunguka", String(error));
    });
});

document.getElementById("mwingine").addEventListener("click", function () {
  kisanduku.style.display = "none";
  anaangalia = false;
});
