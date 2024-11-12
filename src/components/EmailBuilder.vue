<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, Notify } from 'quasar'
import draggable from 'vuedraggable'

interface Component {
  type: string
  content: string
  id: string
  settings?: any
}

const availableComponents = ref([
  { type: 'header', content: 'Texto do Cabeçalho', id: 'header-1' },
  { type: 'text', content: 'Bloco de Texto', id: 'text-1' },
  { type: 'image', content: '', id: 'image-1', settings: { src: '', alt: '' } },
  { type: 'column', content: '', id: 'column-1', settings: { columns: 2 } },
  { type: 'variable', content: '', id: 'variable-1' }
])

const templateComponents = ref<Component[]>([])
const variables = ref<string[]>([])
const selectedComponent = ref<Component | null>(null)
const showPreview = ref(false)

const addVariable = () => {
  Dialog.create({
    title: 'Adicionar Variável',
    prompt: {
      model: '',
      type: 'text',
      label: 'Nome da Variável'
    },
    cancel: true,
    persistent: true,
    ok: {
      label: 'Adicionar',
      color: 'primary'
    },
    cancel: {
      label: 'Cancelar',
      color: 'negative'
    }
  }).onOk((data: string) => {
    if (data && !variables.value.includes(data)) {
      variables.value.push(data)
      Notify.create({
        message: 'Variável adicionada com sucesso',
        color: 'positive'
      })
    }
  })
}

const editComponent = (component: Component) => {
  selectedComponent.value = component
  if (component.type === 'variable') {
    Dialog.create({
      title: 'Selecionar Variável',
      options: {
        type: 'radio',
        model: '',
        items: variables.value.map(v => ({
          label: `{{${v}}}`,
          value: v
        }))
      },
      cancel: true,
      persistent: true,
      ok: {
        label: 'Selecionar',
        color: 'primary'
      },
      cancel: {
        label: 'Cancelar',
        color: 'negative'
      }
    }).onOk((selectedVar: string) => {
      component.content = `{{${selectedVar}}}`
    })
  }
}

const previewContent = computed(() => {
  return templateComponents.value.map(component => {
    switch (component.type) {
      case 'header':
        return `<h1 style="font-size: 24px; margin: 20px 0;">${component.content}</h1>`
      case 'text':
        return `<p style="margin: 10px 0;">${component.content}</p>`
      case 'image':
        return `<img src="${component.settings?.src || 'https://via.placeholder.com/150'}" 
                     alt="${component.settings?.alt || 'Imagem'}" 
                     style="max-width: 100%; height: auto;">`
      case 'column':
        const columnWidth = 100 / (component.settings?.columns || 2)
        let columns = ''
        for (let i = 1; i <= (component.settings?.columns || 2); i++) {
          columns += `<div style="width: ${columnWidth}%; padding: 10px;">Coluna ${i}</div>`
        }
        return `<div style="display: flex; flex-wrap: wrap;">${columns}</div>`
      case 'variable':
        return `<span style="background-color: #e3f2fd; padding: 4px 8px; border-radius: 4px;">${component.content}</span>`
      default:
        return ''
    }
  }).join('\n')
})

const generateTemplate = () => {
  showPreview.value = true
}
</script>

<template>
  <div class="email-builder q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Components Panel -->
      <div class="col-3">
        <q-card class="components-panel">
          <q-card-section>
            <div class="text-h6">Componentes</div>
          </q-card-section>
          <q-card-section>
            <draggable 
              :list="availableComponents"
              :group="{ name: 'components', pull: 'clone', put: false }"
              item-key="id"
              :clone="(item) => ({...item, id: item.type + '-' + Date.now()})"
            >
              <template #item="{ element }">
                <q-item clickable v-ripple class="component-item q-mb-sm">
                  <q-item-section>
                    {{ 
                      element.type === 'header' ? 'Cabeçalho' :
                      element.type === 'text' ? 'Texto' :
                      element.type === 'image' ? 'Imagem' :
                      element.type === 'column' ? 'Colunas' :
                      element.type === 'variable' ? 'Variável' :
                      element.type 
                    }}
                  </q-item-section>
                </q-item>
              </template>
            </draggable>
          </q-card-section>
        </q-card>

        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">Variáveis</div>
            <q-btn 
              color="primary" 
              icon="add" 
              label="Adicionar Variável" 
              class="q-mt-sm"
              @click="addVariable"
            />
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item v-for="variable in variables" :key="variable">
                <q-item-section>
                  &#123;&#123;{{ variable }}&#125;&#125;
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Template Canvas -->
      <div class="col-6">
        <q-card class="template-canvas">
          <q-card-section>
            <div class="text-h6">Template de Email</div>
          </q-card-section>
          <q-card-section>
            <draggable 
              v-model="templateComponents"
              group="components"
              item-key="id"
              class="template-container"
            >
              <template #item="{ element }">
                <div class="template-item q-pa-sm" @click="editComponent(element)">
                  <q-card :class="{ 'selected': selectedComponent === element }">
                    <q-card-section>
                      <div v-if="element.type === 'header'" class="text-h5">
                        {{ element.content }}
                      </div>
                      <div v-else-if="element.type === 'text'">
                        {{ element.content }}
                      </div>
                      <div v-else-if="element.type === 'image'" class="text-center">
                        <img 
                          :src="element.settings?.src || 'https://via.placeholder.com/150'" 
                          :alt="element.settings?.alt || 'Imagem'"
                        >
                      </div>
                      <div v-else-if="element.type === 'column'" class="row">
                        <div 
                          v-for="n in (element.settings?.columns || 2)" 
                          :key="n"
                          class="col"
                        >
                          Coluna {{ n }}
                        </div>
                      </div>
                      <div v-else-if="element.type === 'variable'" class="variable-tag">
                        {{ element.content }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>
            </draggable>
          </q-card-section>
        </q-card>
      </div>

      <!-- Properties Panel -->
      <div class="col-3">
        <q-card v-if="selectedComponent">
          <q-card-section>
            <div class="text-h6">Propriedades</div>
          </q-card-section>
          <q-card-section>
            <q-input 
              v-if="['header', 'text'].includes(selectedComponent.type)"
              v-model="selectedComponent.content" 
              label="Conteúdo"
            />
            <template v-else-if="selectedComponent.type === 'image'">
              <q-input 
                v-model="selectedComponent.settings.src" 
                label="URL da Imagem"
              />
              <q-input 
                v-model="selectedComponent.settings.alt" 
                label="Texto Alternativo"
              />
            </template>
            <q-input 
              v-else-if="selectedComponent.type === 'column'"
              v-model="selectedComponent.settings.columns" 
              type="number"
              label="Número de Colunas"
              min="1"
              max="4"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-mt-md text-center">
      <q-btn 
        color="primary"
        label="Gerar Template"
        @click="generateTemplate"
        class="q-mr-sm"
      />
    </div>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreview" full-width>
      <q-card>
        <q-card-section>
          <div class="text-h6">Prévia do Template</div>
        </q-card-section>

        <q-card-section>
          <div class="preview-container" v-html="previewContent"></div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
.email-builder {
  min-height: 100vh;
}

.component-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: move;
}

.template-container {
  min-height: 400px;
  border: 2px dashed #ddd;
  padding: 1rem;
}

.template-item {
  cursor: pointer;
  
  .q-card {
    transition: all 0.3s ease;
    
    &.selected {
      border: 2px solid #1976D2;
    }
  }
}

.variable-tag {
  background: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.preview-container {
  background: white;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 300px;
}

:deep(.preview-container) {
  img {
    max-width: 100%;
    height: auto;
  }
}
</style>