import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadinterval;

const loader = (element) => {
  element.textContent = "";

  loadinterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

const typeText = (element, text) => {
  let i = 0;
  let interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (i === text.length) {
      clearInterval(interval);
    }
  }, 20);
}

const generateUniqueID = () => {
  const timestamp = Date.now();
  return `id_${timestamp}`;
}

const chatStripe = (isAi, value, id) => {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src=${isAi ? bot : user} alt="${isAi ? "bot" : "user"}"/>
        </div>
        <div class="message" id="${id}">
          ${value}
        </div>     
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const promptvalue = data.get("prompt");

  chatContainer.innerHTML += chatStripe(false, promptvalue);

  form.reset();

  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.querySelector(`#${uniqueID}`);
  loader(messageDiv)

  const response = await fetch("http://localhost:5000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    })
  });

  clearInterval(loadinterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot // trims any trailing spaces/'\n'
    console.log(parsedData.length)
    typeText(messageDiv, parsedData)
  } else {
    const error = await response.text();
    typeText(messageDiv, "Something went wrong");
    alert(error);
  }

}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});