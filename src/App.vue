<template>
  <router-view />
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kosugi+Maru&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

@layer base, util;

@layer base {
  * {
    box-sizing: border-box;
    margin: 0px;
    padding: 0px;
    -webkit-user-select: none; /* Safari */
    user-select: none;
    font-family: "Roboto", sans-serif;
  }
}

button.icon-button {
  width: 40px;
  height: 40px;
  border: 0;
  background-color: #eeeeee;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

button.icon-button.primary {
  background-color: #aaaaaa;
}

button.icon-button.silent {
  background-color: transparent;
}

button.icon-button:hover {
  background-color: #cccccc;
}

button.icon-button:active {
  background-color: #aaaaaa;
}

button.text-button {
  background-color: #dddddd;
  color: #000000;
  min-width: 120px;
  padding: 5px 20px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

button.text-button.primary {
  background-color: #000000;
  color: #ffffff;
}

button.text-button.silent {
  background-color: transparent;
  color: #000000;
  border: #cccccc 1px solid;
}

button.text-button:active {
  background-color: #222222;
}

button.text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}

.popup {
  background-color: #ffffff;
  border: 0;
  font-size: 14px;
  border-radius: 10px;
  box-shadow: 0 0 50px 10px rgba(100, 100, 100, 0.15);
  display: flex;
  flex-direction: column;
}

.popup > * {
  padding: 20px 20px 0 20px;
}

.popup > *:last-child {
  padding: 20px;
}

@layer util {
  .mt-3 {
    margin-top: 10px;
  }
}
</style>
