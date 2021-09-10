<template>
  <div class='district_style'>
        <h1 v-if="district.properties" class="font-bold">
            <i class="fas fa-city"></i>
            {{district.properties.TOWNNAME}}
        </h1>
  </div>
</template>

<script>
export default {
    props: {
        district: Object,
    },
}
</script>

<style>

.district_style{
    z-Index: 1002;
}


</style>