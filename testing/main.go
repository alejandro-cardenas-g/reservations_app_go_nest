package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

func main() {

	wg := sync.WaitGroup{}

	con := 1000

	wg.Add(con)

	dto := map[string]string{
		"roomId":   "019c906a-f120-7fc8-8ad6-ce766937b7d0",
		"checkIn":  "2026-02-26",
		"checkOut": "2026-02-27",
	}

	body, _ := json.Marshal(dto)

	for i := 0; i < con; i++ {
		go func(iteration int) {
			defer wg.Done()
			req, err := http.NewRequest(
				http.MethodPost,
				"http://localhost:3000/api/v1/reservations",
				bytes.NewBuffer(body),
			)
			if err != nil {
				fmt.Println(err)
			}
			req.Header.Add("Authorization", "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJJZGVudGl0eSIsInNpZCI6IjAxOWM4ZmYxLTUyMDAtNzcxOC05NTVhLTQ5ZjE4NzA0YTVjMCIsInRva2VuIjoiMDE5Yzk3NTktZTVmYi03ZjRkLTkzNzUtMzRjYTFmM2FiMTdmIiwiaWF0IjoxNzcyMDcxMDc3LCJleHAiOjE3NzIwNzE5Nzd9.NIEZsPxT_mhxRB6ySKJx-MPwTMwEemHb6DPnlauXrvVkDLVYZfhGC8pWKrHNplim2seLAWPEGd0bLlB8wAjZ2CHlUWRy8-BxGEozAQhPc9AE1cZdALccp-nuHBeBxYVbWJdlAUqmJVxnLheZ7OeE6koOv2dLfIt3YqHghd00HklKcj5TGqZRJkuhAWBv2Xief2JLowRDKBYxjdCuSeQXQCNYNzTRL2Nh_cjWx4v1NDuycg4Pv64QsdEgTc2ajnDbCfIP_I6yz0JvjjWndq7BGaSg_iLdfdQVJ9xwz0jAug6HDuZnKAqp4h7p5NfyMNmElunCqa4IP-ZP3J4DdWRvElgc2cmzpanh4pWi2Vp48VHoaZLKapqmRFpAu7b_5FJYhixJR2Uy-Ux2cZLAxhguSJ_sBz0_Ad2QrJWcav_3Uj8huYsk2BqE6r216LUGxnZOinYhnSyUQLxGoXAMXk43v0cw3-noEbrXQCg6Q3fY4EieNmza9VM8QuET6J49LLgdzXY6t67dC6O75EjEDZbuTgqIF7uGNJWVO_5GymEd-t66vbQ1JMPFmma5CCBfg6N4MdDlSWcpNyBzEVtd2LfhmOhG5yG7yp48OyWUoGMc3DEa-F3WxHjQcJnO1P6Q31GJE9sWpM1iR6dtaAR-a6whV93b1vsa6MfarIkA4fVjIF0")
			req.Header.Add("Content-Type", "application/json")

			client := &http.Client{}
			resp, err := client.Do(req)
			if err != nil {
				fmt.Println(err)
				return
			}

			defer resp.Body.Close()
			fmt.Println(iteration, resp.StatusCode)
		}(i)

	}

	wg.Wait()
}
