class AgendasController < ApplicationController
  before_action :set_organisation
  before_action :set_meeting
  before_action :set_agenda, only: %i[ show edit update destroy ]

  # GET /agendas or /agendas.json
  def index
    @agendas = Agenda.where(meeting_id: @meeting.id)
  end

  # GET /agendas/1 or /agendas/1.json
  def show
  end

  # GET /agendas/new
  def new
    @agenda = Agenda.new
    @agenda.meeting_id = @meeting.id
  end

  # GET /agendas/1/edit
  def edit
  end

  def move

    @agenda = Agenda.find(params[:agenda_id])
    direction = params[:direction]
    if direction == 'up'
      @agenda.move_higher
    else
      @agenda.move_lower
    end

    respond_to do |format|
        format.html { redirect_to organisation_meeting_agendas_url(@organisation, @meeting), notice: "Item was successfully moved." }
    end



  end


  def complete

    @agenda = Agenda.find(params[:agenda_id])
    @agenda.close! if @agenda.may_close? 
   
    respond_to do |format|
        format.html { redirect_to organisation_meeting_agendas_url(@organisation, @meeting), notice: "Item was successfully moved." }
    end



  end

  # POST /agendas or /agendas.json
  def create
    @agenda = Agenda.new(agenda_params)

    respond_to do |format|
      if @agenda.save
        format.html { redirect_to organisation_meeting_agendas_url(@organisation, @meeting), notice: "Agenda was successfully created." }
        format.json { render :show, status: :created, location: @agenda }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @agenda.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /agendas/1 or /agendas/1.json
  def update
    respond_to do |format|
      if @agenda.update(agenda_params)
        format.html { redirect_to organisation_meeting_agendas_url(@organisation, @meeting), notice: "Agenda was successfully updated." }
        format.json { render :show, status: :ok, location: @agenda }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @agenda.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /agendas/1 or /agendas/1.json
  def destroy
    @agenda.destroy

    respond_to do |format|
      format.html { redirect_to organisation_meeting_agendas_url(@organisation, @meeting), notice: "Agenda was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    def set_meeting
      @meeting = Meeting.find(params[:meeting_id])
    end
    def set_organisation
      @organisation = Organisation.find(params[:organisation_id])
    end
    # Use callbacks to share common setup or constraints between actions.
    def set_agenda
      @agenda = Agenda.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def agenda_params
      params.require(:agenda).permit(:meeting_id, :name, :duration_minutes)
    end
end
