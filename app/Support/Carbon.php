<?php

namespace App\Support;

class Carbon extends \Illuminate\Support\Carbon
{
    /**
     * @return Carbon
     */
    public function toAppTz()
    {
        return $this->setTimezone(config('app.timezone'));
    }

    /**
     * @return Carbon
     */
    public function toBaseTz()
    {
        return $this->setTimezone(config('app.base_timezone'));
    }
}
