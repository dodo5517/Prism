import React, {useEffect, useState} from 'react';
import {AnalyzeResponse, CalendarDetailResponseDto} from '@/types/diary';
import {deleteLog, generateImageOnly, getDiaryDetail, regenerateImage} from '@/api/diaryApi';
import LoadingScreen from '@/components/LoadingScreen';
import KeywordLoading from "@/components/KeywordLoading";

interface ResultModalProps {
    data: CalendarDetailResponseDto | null;
    onClose: () => void;
    onUpdateDiary?: (updated: CalendarDetailResponseDto) => void;
    onDeleteDiary?: (id: number) => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ data, onClose, onUpdateDiary, onDeleteDiary }) => {
    const [localData, setLocalData] = useState<CalendarDetailResponseDto | null>(data);

    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [keywords, setKeywords] = useState<string[]>([]);

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    if (!localData) return null;

    // 삭제 핸들러
    const handleDelete = async (id:number) => {
        if (!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return;
        try {
            await deleteLog(id);
            alert('삭제되었습니다.');
            // 달력에서 삭제 하도록 전달
            onDeleteDiary?.(id);
        } catch (error) {
            console.error(error);
            alert('삭제 실패했습니다.');
        } finally {
            onClose();
        }
    };

    // 다시 만들기 핸들러
    const handleRecreate = async (id:number) => {
        if (!confirm('이미지를 다시 생성하시겠습니까? 기존 이미지는 사라집니다.')) return;

        try {
            // 재분석 시작
            setIsAnalyzing(true);
            const newAnalysisResult:AnalyzeResponse = await regenerateImage(id);
            setIsAnalyzing(false);

            // 분석 완료 -> 키워드 애니메이션 시작
            setKeywords(newAnalysisResult.keywords);
            setIsGenerating(true);

            // 이미지 생성 요청
            await generateImageOnly(newAnalysisResult.logId);
            // 최종 완료 -> 상세 데이터 가져오기
            const detailData = await getDiaryDetail(newAnalysisResult.logId);

            if (detailData) {
                // 현재 보고 있는 모달 데이터 업데이트
                setLocalData({ ...detailData });
                // 달력 업데이트 하도록 전달
                onUpdateDiary?.(detailData);
            }

        } catch (error) {
            console.error(error);
            alert('이미지 생성에 실패했습니다.');
        } finally {
            // 애니메이션 종료
            setIsGenerating(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* 배경 */}
            <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />

            {/* 모달 */}
            <div
                className="relative w-full max-w-[340px] sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 내용 */}
                <div className="p-5 sm:p-6">
                    {/* 닫기 */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-all z-10"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* 이미지 */}
                    <div className="w-full aspect-square mb-4 rounded-xl overflow-hidden bg-neutral-100 relative group">
                        {localData?.imageUrl ? (
                            <>
                                <img
                                    src={localData.imageUrl}
                                    key={localData.imageUrl}
                                    alt="AI Created"
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,100,100,0.1) 0%, rgba(255,200,100,0.1) 20%, rgba(100,255,150,0.1) 40%, rgba(100,200,255,0.1) 60%, rgba(200,100,255,0.1) 80%, transparent 100%)'
                                    }}
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm">이미지가 없습니다</span>
                            </div>
                        )}
                    </div>

                    {/* 날짜 */}
                    <p className="text-sm text-neutral-500 mb-3">{localData?.date}</p>

                    {/* 키워드 */}
                    {localData?.keywords && localData?.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {localData?.keywords.map((k, index) => {
                                // 무지개 색상 순서
                                const colors = [
                                    'bg-red-50 text-red-600 border-red-100',
                                    'bg-orange-50 text-orange-600 border-orange-100',
                                    'bg-amber-50 text-amber-600 border-amber-100',
                                    'bg-emerald-50 text-emerald-600 border-emerald-100',
                                    'bg-blue-50 text-blue-600 border-blue-100',
                                    'bg-indigo-50 text-indigo-600 border-indigo-100',
                                    'bg-violet-50 text-violet-600 border-violet-100',
                                ];
                                return (
                                    <span
                                        key={index}
                                        className={`px-2.5 py-1 text-xs rounded-full border ${colors[index % colors.length]}`}
                                    >
                                        #{k}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* 본문 */}
                    <div className="mb-5 p-4 bg-neutral-50 rounded-xl">
                        <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {localData?.content}
                        </p>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleRecreate(localData!.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all active:scale-[0.98] text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            다시 그리기
                        </button>
                        <button
                            onClick={() => handleDelete(localData!.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-[0.98] text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            삭제
                        </button>
                    </div>
                </div>
            </div>
            {/* 키워드 애니메이션 로딩 */}
            {isGenerating && <KeywordLoading keywords={keywords} />}
            {/* 기본 스피너 로딩 */}
            {isAnalyzing && <LoadingScreen />}
        </div>
    );
};

export default ResultModal;