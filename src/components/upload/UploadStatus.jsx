import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, XCircle, Shield } from 'lucide-react';

const UploadStatus = ({ video }) => {
  if (!video) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'in_review':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          title: 'Em Análise ACRCloud',
          description: 'Verificando direitos autorais automaticamente...'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          title: 'Aguardando Moderação',
          description: 'Passou na verificação ACRCloud. Aguardando aprovação manual.'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          title: 'Aprovado',
          description: 'Seu vídeo foi aprovado e está visível na plataforma!'
        };
      case 'blocked_copyright':
        return {
          icon: Shield,
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          title: 'Bloqueado - Direitos Autorais',
          description: 'Detectamos possível violação de direitos autorais. Upload bloqueado.'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          title: 'Rejeitado',
          description: 'Seu vídeo foi rejeitado durante a moderação.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/30',
          title: 'Status Desconhecido',
          description: 'Verificando status...'
        };
    }
  };

  const config = getStatusConfig(video.status);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bg} ${config.border} border rounded-xl p-4 mb-4`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${config.color}`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.color}`}>
            {config.title}
          </h4>
          <p className="text-gray-300 text-sm mt-1">
            {config.description}
          </p>
        </div>
      </div>

      {/* Detalhes da análise ACRCloud se disponível */}
      {video.acr_analysis && video.acr_analysis.analyzed && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <h5 className="text-white font-medium mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Resultado ACRCloud:
          </h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Match:</span>
              <span className={`ml-2 ${video.acr_analysis.match_found ? 'text-red-400' : 'text-green-400'}`}>
                {video.acr_analysis.match_found ? 'Encontrado' : 'Não encontrado'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Confiança:</span>
              <span className="ml-2 text-white">{video.acr_analysis.confidence || 0}%</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UploadStatus;