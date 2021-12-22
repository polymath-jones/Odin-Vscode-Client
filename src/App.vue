<template>
  <router-view class="domdd"/>
</template>

<style>
.scrollbar-track{
  background-color: #84828e !important;
}

* {
  box-sizing: border-box;
}
body {
  margin: 0px;
  background-color: #3e3d40;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #3e3d40;
}

.custom-scroll::-webkit-scrollbar-track {
	-webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.123);
	background-color: #84828E;
}

.custom-scroll::-webkit-scrollbar {
	width: 8px;
	background-color: #84828E;
}

.custom-scroll::-webkit-scrollbar-thumb {
	-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.205);
	background-color: #313133;
}
</style>
