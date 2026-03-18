<template>
    <q-card class="docs-container" flat>
        <q-card-section class="q-pb-none">
            <div class="section-header">
                <div class="header-accent"></div>
                <div>
                    <div class="section-title">Documentos del Trámite</div>
                    <div class="section-subtitle">Gestión y visualización de archivos adjuntos</div>
                </div>
            </div>
        </q-card-section>

        <q-card-section>
            <!-- Estado vacío global -->
            <div v-if="loadedDocs.length === 0" class="no-docs-state">
                <div class="no-docs-icon-wrap">
                    <q-icon name="folder_open" size="48px" />
                </div>
                <div class="no-docs-title">Sin documentos adjuntos</div>
                <div class="no-docs-sub">El contratista aún no ha cargado ningún documento</div>
            </div>

            <!-- Tarjetas solo de documentos cargados -->
            <div v-else class="row q-col-gutter-lg">
                <div v-for="doc in loadedDocs" :key="doc.key" class="col-12 col-md-6 col-lg-4">
                    <div class="doc-card doc-card--loaded"
                        :class="{
                            'doc-card--ticket': doc.isTiquete,
                            'doc-card--optional': doc.optional
                        }">

                        <div class="doc-card__header">
                            <div class="doc-card__number" :class="{ 'ticket-number': doc.isTiquete }">
                                {{ doc.number }}
                            </div>
                            <div class="doc-card__label">
                                {{ doc.label }}
                                <span v-if="doc.optional" class="optional-tag">opcional</span>
                            </div>
                            <div class="doc-card__badge badge--ok">
                                <q-icon name="check_circle" size="14px" />
                                Cargado
                            </div>
                        </div>

                        <div class="doc-card__preview">
                            <div v-if="doc.file.url.startsWith('blob:') || doc.file.url.toLowerCase().includes('.pdf')"
                                class="doc-card__pdf-placeholder">
                                <div class="pdf-icon-wrap">
                                    <q-icon name="picture_as_pdf" size="36px" color="white" />
                                </div>
                                <span class="pdf-label">Documento PDF</span>
                            </div>
                            <q-img v-else
                                :src="resolveUrl(doc.file.url)"
                                class="doc-card__image" fit="contain" />
                        </div>

                        <div class="doc-card__footer">
                            <q-btn flat no-caps class="view-btn"
                                @click="openPreview(resolveUrl(doc.file.url), doc.file.url)">
                                <q-icon name="open_in_new" size="15px" class="q-mr-xs" />
                                Ver documento
                            </q-btn>
                        </div>

                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>

    <!-- DIALOG PREVIEW -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
        <q-card class="preview-dialog">

            <div class="preview-dialog__header">
                <div class="preview-dialog__title">
                    <q-icon name="description" size="20px" class="q-mr-sm" />
                    Vista previa del documento
                </div>
                <q-btn icon="close" flat dense round class="preview-close-btn" v-close-popup />
            </div>

            <div class="preview-dialog__body">
                <iframe v-if="isPdf" :src="previewUrl" class="preview-iframe" />
                <div v-else class="preview-image-wrap">
                    <q-img :src="previewUrl" fit="contain" class="preview-image" />
                </div>
            </div>

        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    documents: Object
})

    const BASE_URL = import.meta.env.VITE_API_URL

function resolveUrl(url) {
    if (!url) return null
    if (url.startsWith('blob:') || url.startsWith('http')) return url
    return `${BASE_URL}${url}`
}

const loadedDocs = computed(() => {
    const list = []

    if (props.documents?.autorizacionPago?.[0]?.url)
        list.push({ key: 'autorizacionPago', number: 1, label: 'Autorización de Pago', file: props.documents.autorizacionPago[0] })

    if (props.documents?.compromisoPresupuestal?.[0]?.url)
        list.push({ key: 'compromisoPresupuestal', number: 2, label: 'Compromiso Presupuestal', file: props.documents.compromisoPresupuestal[0] })

    if (props.documents?.asistenciaFormacion?.[0]?.url)
        list.push({ key: 'asistenciaFormacion', number: 3, label: 'Asistencia de Formación', file: props.documents.asistenciaFormacion[0] })

    const tiquetes = props.documents?.tiquetes || []
    tiquetes.forEach((t, i) => {
        if (t?.url) list.push({
            key: `tiquete-${i}`,
            number: i === 0 ? 4 : `4.${i + 1}`,
            label: i === 0 ? 'Tiquetes del Viaje' : `Tiquete ${i + 1}`,
            isTiquete: true,
            file: t
        })
    })

    if (props.documents?.reintegros?.[0]?.url)
        list.push({ key: 'reintegros', number: 5, label: 'Reintegros', optional: true, file: props.documents.reintegros[0] })

    if (props.documents?.interveredal?.[0]?.url)
        list.push({ key: 'interveredal', number: 6, label: 'Interveredal', optional: true, file: props.documents.interveredal[0] })

    return list
})

const showPreview = ref(false)
const previewUrl = ref(null)
const previewIsPdf = ref(false)

// isPdf basado en la ref, no en la URL (funciona con blob: también)
const isPdf = computed(() => previewIsPdf.value)

function openPreview(url, originalUrl) {
    const original = originalUrl || url

    // blob: URLs → abrir directo en nueva pestaña (los iframes las bloquean)
    if (original?.startsWith('blob:')) {
        window.open(url, '_blank')
        return
    }

    previewIsPdf.value = original?.toLowerCase().includes('.pdf')
    previewUrl.value = url
    showPreview.value = true
}
</script>

<style scoped>
.docs-container {
    background: #f6faf6;
    border-radius: 16px !important;
    min-height: 50vh;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 4px;
}

.header-accent {
    width: 5px;
    height: 44px;
    border-radius: 4px;
    background: linear-gradient(180deg, #2e7d32, #66bb6a);
    flex-shrink: 0;
}

.section-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #1a3320;
    letter-spacing: -0.3px;
}

.section-subtitle {
    font-size: 0.78rem;
    color: #8a94a8;
    margin-top: 2px;
}

.doc-card {
    background: #ffffff;
    border-radius: 14px;
    border: 1.5px solid #e8ecf4;
    overflow: hidden;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
    display: flex;
    flex-direction: column;
}

.doc-card:hover {
    box-shadow: 0 8px 28px rgba(46, 125, 50, 0.12);
    transform: translateY(-2px);
}

.doc-card--loaded {
    border-color: #c8e6c9;
}

.doc-card__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px 12px;
    border-bottom: 1px solid #f0f2f8;
}

.doc-card__number {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, #2e7d32, #66bb6a);
    color: white;
    font-size: 0.78rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.ticket-number {
    background: linear-gradient(135deg, #1b5e20, #388e3c) !important;
    font-size: 0.68rem;
    letter-spacing: 0.3px;
}

.doc-card__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #1b3a1e;
    flex: 1;
    line-height: 1.3;
}

.doc-card__badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.68rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 20px;
    flex-shrink: 0;
}

.badge--ok {
    background: #e8f5e9;
    color: #2e7d32;
}

.badge--empty {
    background: #fff3e0;
    color: #e65100;
}

.doc-card__preview {
    flex: 1;
    height: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f8f1;
    overflow: hidden;
}

.doc-card__image {
    height: 190px;
    width: 100%;
}

.doc-card__pdf-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.pdf-icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, #e53935, #ef9a9a);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(229, 57, 53, 0.3);
}

.pdf-label {
    font-size: 0.78rem;
    color: #7a8499;
    font-weight: 500;
}

.doc-card--optional {
    border-style: dashed;
}

.optional-tag {
    font-size: 0.62rem;
    font-weight: 600;
    color: #8a94a8;
    background: #f0f2f8;
    border-radius: 10px;
    padding: 1px 6px;
    margin-left: 5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    vertical-align: middle;
}

.doc-card__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #b0bac8;
    font-size: 0.8rem;
    padding: 8px;
}

.empty-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #eef0f6;
    border: 1.5px dashed #c8cfe0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b0bac8;
}

.empty-label {
    font-size: 0.78rem;
    color: #a0aab8;
    font-weight: 500;
}

.empty-required {
    display: flex;
    align-items: center;
    font-size: 0.68rem;
    color: #e65100;
    font-weight: 500;
    background: #fff3e0;
    padding: 2px 8px;
    border-radius: 10px;
}

.doc-card__footer {
    padding: 10px 12px;
    border-top: 1px solid #f0f2f8;
    display: flex;
    justify-content: flex-end;
}

.view-btn {
    font-size: 0.78rem;
    font-weight: 600;
    color: #2e7d32 !important;
    padding: 4px 12px;
    border-radius: 8px;
    transition: background 0.2s;
}

.view-btn:hover {
    background: #e8f5e9 !important;
}

.no-docs-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 56px 24px;
    text-align: center;
}

.no-docs-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: #eef0f6;
    border: 2px dashed #c8cfe0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b0bac8;
}

.no-docs-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #6b7590;
}

.no-docs-sub {
    font-size: 0.78rem;
    color: #a0aab8;
}

.preview-dialog {
    background: #0d1117 !important;
    display: flex;
    flex-direction: column;
}

.preview-dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #161b27;
    border-bottom: 1px solid #2a3045;
}

.preview-dialog__title {
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    font-weight: 600;
    color: #e8eaf0;
    letter-spacing: 0.2px;
}

.preview-close-btn {
    color: #8a94a8 !important;
}

.preview-close-btn:hover {
    color: #ffffff !important;
    background: #2a3045 !important;
}

.preview-dialog__body {
    flex: 1;
    overflow: hidden;
    padding: 0;
}

.preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}

.preview-image-wrap {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.preview-image {
    max-width: 100%;
    max-height: calc(100vh - 80px);
}
</style>