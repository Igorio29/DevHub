<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {
    }

    public function index(Request $request)
    {
        try {
            return response()->json($this->dashboardService->build($request));
        } catch (ConnectionException $exception) {
            return response()->json([
                'error' => 'GitLab indisponivel no momento.',
            ], 503);
        } catch (\RuntimeException $exception) {
            $status = $exception->getMessage() === 'Usuario nao autenticado' ? 401 : 422;

            return response()->json([
                'error' => $exception->getMessage(),
            ], $status);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'error' => 'Erro ao montar dashboard.',
            ], 500);
        }
    }
}
