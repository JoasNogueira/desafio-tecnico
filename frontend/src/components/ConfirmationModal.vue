<template>
  <div 
    v-if="show" 
    @click.self="$emit('close')"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm transition-opacity cursor-pointer"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100 cursor-default">
      
      <h3 class="text-xl font-bold text-gray-800 mb-2">{{ title }}</h3>
      
      <p class="text-gray-600 mb-6">{{ message }}</p>

      <div class="flex justify-end gap-3">
        <button 
          v-if="showCancel"
          @click="$emit('close')" 
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-medium cursor-pointer"
          data-testid="btn-cancel">
          Cancelar
        </button>
        
        <button 
          @click="$emit('confirm')" 
          :class="['px-4 py-2 text-white rounded transition font-bold shadow-md cursor-pointer', confirmColor]"
          data-testid="btn-confirm">
          {{ confirmText }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: 'Atenção' },
  message: { type: String, default: 'Mensagem do sistema.' },
  
  
  showCancel: { type: Boolean, default: true }, 
  confirmText: { type: String, default: 'Confirmar' }, 
  confirmColor: { type: String, default: 'bg-red-600 hover:bg-red-700' } 
});

defineEmits(['close', 'confirm']);
</script>