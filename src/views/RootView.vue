<script setup>
import { ref } from 'vue'
import { Auth } from 'aws-amplify'

const email = ref('')
const password = ref('')
const verificationCode = ref('')
const secretCode = ref('')
const signUpStep = ref('SIGN_UP')
const signInStep = ref('SIGN_IN')
const attemptsLeft = ref(0)
const isSignedIn = ref(false)
let cognitoUser

async function signUp() {
  try {
    const signInResult = await Auth.signUp({
      username: email.value,
      password: password.value,
    })
    console.log(signInResult.user)

    signUpStep.value = 'CONFIRM'    
  } catch (error) {
    alert(error.message)
  }
}

async function confirmUser() {
  const result = await Auth.confirmSignUp(cognitoUser.username, verificationCode.value)
  console.log(result)
}

async function signIn() {
  try {
    cognitoUser = await Auth.signIn(email.value)
    console.log(cognitoUser)

    signInStep.value = 'CUSTOM_CHALLENGE'
    attemptsLeft.value = parseInt(cognitoUser.challengeParam.attemptsLeft)
  } catch (error) {
    alert(error.message)
  }
}

async function answerCustomChallenge() {
  // This will throw an error if it’s the 3rd wrong answer
  try {
    const challengeResult = await Auth.sendCustomChallengeAnswer(cognitoUser, secretCode.value)
    console.log(challengeResult)

    if (challengeResult.challengeName) {
      secretCode.value = ''
      attemptsLeft.value = parseInt(challengeResult.challengeParam.attemptsLeft)

      alert(`The code you entered is incorrect. ${attemptsLeft.value} attempts left.`)
    } else {      
      isSignedIn.value = true    
    }
  } catch (error) {
    secretCode.value = ''
    signInStep.value = 'SIGN_IN'
    alert('Too many failed attempts. Please try again.')
  }  
}

async function signOut() {
  await Auth.signOut({ global: true })
  cognitoUser = null
  secretCode.value = ''
  isSignedIn.value = false
  signInStep.value = 'SIGN_IN'

  console.log(await Auth.currentUserInfo())
}
</script>

<template>
  <h1 class="font-bold text-4xl mb-12">Passwordless OTP demo with Cognito</h1>

  <div class="w-1/2 flex-row mb-10">
    <h2 class="font-semibold text-xl">Step 1. register a user (if you haven't already)</h2>
    <p>Password requirements: 8 chars (lower case, number, upper case + symbol)</p>

    <input 
      v-model="email" 
      type="text"
      class="mt-2 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="Email address">
    <input 
      v-model="password" 
      type="password"
      class="mt-1 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="Password">
    <input 
      v-if="signUpStep === 'CONFIRM'"
      v-model="verificationCode" 
      type="text"
      class="mt-1 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="Verification code (check email)">

    <button 
      v-if="signUpStep === 'SIGN_UP'"
      @click="signUp" 
      class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Create user
    </button>
    <button 
      v-if="signUpStep === 'CONFIRM'"
      @click="confirmUser"
      class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Confirm user
    </button>
  </div>

  <div class="w-1/2 flex-row mb-10">
    <h2 class="font-semibold text-xl">Step 2. sign in with OTP code</h2>

    <input 
      v-model="email" 
      type="text"
      class="mt-2 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="Email address">
    <input 
      v-if="signInStep === 'CUSTOM_CHALLENGE'"
      v-model="secretCode" 
      type="text"
      class="mt-1 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="OTP code (check email)">

    <button v-if="signInStep === 'SIGN_IN'"
      @click="signIn"
      class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Passwordless sign in
    </button>
    <button v-if="signInStep === 'CUSTOM_CHALLENGE'"
      @click="answerCustomChallenge" 
      class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Submit
    </button>
  </div>

  <div v-if="isSignedIn" class="w-1/2 flex-row mb-10">
    <h2 class="font-semibold text-xl">Step 3. you're signed in! Sign out and try again.</h2>

    <button v-if="isSignedIn"
      @click="signOut" 
      class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Sign out
    </button>
  </div>
</template>
