<template>
    <!-- Tab panes -->
    <div>
        <button 
            v-show="$route.path != '/'"
            class="bg-gray-400 text-white rounded px-4 py-2 font-bold" 
            @click="$router.push('/')">回首頁</button>
        <router-view />
    </div>

</template>

<script>
export default {
  
}
</script>


<style scoped>


</style>