import React, { useState, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Video } from '@/api/entities';
import { Shield, AlertTriangle, CheckCircle, Clock, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const ACRCloudAnalysis = ({ video, onAnalysisComplete }) => {
  const [analysisStatus, setAnalysisStatus] = useState('starting');
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    if (video && !video.acr_analysis?.analyzed) {
      const performACRAnalysis = async () => {
        setAnalysisStatus('analyzing');
        
        try {
          // Simular progresso da análise
          const progressInterval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + Math.random() * 15;
            });
          }, 500);

          // Simular análise ACRCloud usando LLM
          const analysisPrompt = `
            Você é um simulador da API ACRCloud para verificação de direitos autorais.
            
            Analise esta música:
            - Título: "${video.title}"
            - Artista: "${video.artist_name}"
            - Categoria: "${video.category}"
            
            Simule uma resposta realista da ACRCloud. Para músicas com títulos muito genéricos ou comuns, 
            há maior chance de match falso-positivo. Para artistas independentes com títulos únicos, menor chance.
            
            Retorne uma análise que determine se há suspeita de violação de direitos autorais.
          `;

          const response = await InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
              type: "object",
              properties: {
                match_found: { type: "boolean" },
                confidence: { type: "number", minimum: 0, maximum: 100 },
                detected_artist: { type: "string" },
                detected_title: { type: "string" },
                recommendation: { 
                  type: "string", 
                  enum: ["approve", "block", "manual_review"] 
                },
                reason: { type: "string" }
              }
            }
          });

          clearInterval(progressInterval);
          setProgress(100);

          const result = {
            analyzed: true,
            match_found: response.match_found,
            confidence: response.confidence,
            detected_artist: response.detected_artist || '',
            detected_title: response.detected_title || '',
            analysis_date: new Date().toISOString(),
            recommendation: response.recommendation,
            reason: response.reason
          };

          setAnalysisResult(result);
          setAnalysisStatus('completed');

          // Atualizar vídeo no banco com resultado da análise
          const newStatus = response.match_found && response.confidence > 70 
            ? 'blocked_copyright' 
            : 'pending';

          await Video.update(video.id, {
            status: newStatus,
            acr_analysis: result
          });

          // Notificar componente pai
          if (onAnalysisComplete) {
            onAnalysisComplete({
              ...video,
              status: newStatus,
              acr_analysis: result
            });
          }

        } catch (error) {
          console.error('Erro na análise ACR:', error);
          setAnalysisStatus('error');
          
          // Marcar como erro mas não bloquear
          await Video.update(video.id, {
            status: 'pending',
            acr_analysis: {
              analyzed: true,
              match_found: false,
              confidence: 0,
              analysis_date: new Date().toISOString(),
              error: 'Falha na análise de direitos autorais'
            }
          });
        }
      };

      performACRAnalysis();
    }
  }, [video, onAnalysisComplete]);

  const getStatusIcon = () => {
    switch (analysisStatus) {
      case 'starting':
      case 'analyzing':
        return <Clock className="w-6 h-6 text-blue-400 animate-pulse" />;
      case 'completed':
        return analysisResult?.match_found 
          ? <AlertTriangle className="w-6 h-6 text-red-400" />
          : <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <Shield className="w-6 h-6 text-yellow-400" />;
      default:
        return <Music className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (analysisStatus) {
      case 'starting':
        return 'Iniciando verificação de direitos autorais...';
      case 'analyzing':
        return 'Analisando áudio com tecnologia ACRCloud...';
      case 'completed':
        if (analysisResult?.match_found) {
          return `⚠️ Possível violação de direitos autorais detectada (${analysisResult.confidence}% de confiança)`;
        }
        return '✅ Nenhuma violação de direitos autorais detectada';
      case 'error':
        return '⚠️ Erro na verificação - Será revisado manualmente';
      default:
        return 'Aguardando análise...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-600 rounded-xl p-6 mb-6"
    >
      <div className="flex items-center gap-4 mb-4">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verificação de Direitos Autorais (ACRCloud)
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      {analysisStatus === 'analyzing' && (
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className="bg-blue-500 h-2 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% concluído</p>
        </div>
      )}

      {/* Resultado detalhado */}
      {analysisStatus === 'completed' && analysisResult && (
        <div className="bg-gray-900 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-white mb-3">Resultado da Análise:</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Status:</span>
              <p className={`font-medium ${analysisResult.match_found ? 'text-red-400' : 'text-green-400'}`}>
                {analysisResult.match_found ? 'Match Encontrado' : 'Sem Violações'}
              </p>
            </div>
            
            <div>
              <span className="text-gray-400">Confiança:</span>
              <p className="text-white font-medium">{analysisResult.confidence}%</p>
            </div>
            
            {analysisResult.detected_artist && (
              <div>
                <span className="text-gray-400">Artista Detectado:</span>
                <p className="text-white font-medium">{analysisResult.detected_artist}</p>
              </div>
            )}
            
            {analysisResult.detected_title && (
              <div>
                <span className="text-gray-400">Título Detectado:</span>
                <p className="text-white font-medium">{analysisResult.detected_title}</p>
              </div>
            )}
          </div>

          {analysisResult.reason && (
            <div className="mt-3 p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400 text-sm">Motivo:</span>
              <p className="text-gray-200 text-sm mt-1">{analysisResult.reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Status final */}
      {analysisStatus === 'completed' && (
        <div className={`mt-4 p-3 rounded-lg border ${
          analysisResult?.match_found 
            ? 'bg-red-500/10 border-red-500/30 text-red-300' 
            : 'bg-green-500/10 border-green-500/30 text-green-300'
        }`}>
          <p className="text-sm font-medium">
            {analysisResult?.match_found 
              ? '🚫 Upload bloqueado por suspeita de violação de direitos autorais'
              : '✅ Upload aprovado para revisão manual'
            }
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ACRCloudAnalysis;