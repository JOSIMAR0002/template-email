<script setup lang="ts">
import EmailBuilder from './components/EmailBuilder.vue'
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          Construtor de Template de Email
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <EmailBuilder />
    </q-page-container>
  </q-layout>
</template>