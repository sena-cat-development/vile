<template>
    <div class="row">
        <div class="col-12">
            <h6 class="q-mt-md q-ml-sm q-mb-none"><label class="text-red">Error:</label> Página no encontrada</h6>
        </div>
        <div class="col-12 q-mt-sm q-pl-lg">
            <q-btn @click="routeBack()" label="Volver" icon="arrow_back" />
        </div>
    </div>
</template>

<script setup>
    import { useRouter } from 'vue-router'

    const router = useRouter()

    function routeBack() {
        router.replace('/')
    }
</script>